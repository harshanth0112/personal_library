from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import os
import shutil
import uuid
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from groq import Groq
import boto3
from apig_wsgi import make_lambda_handler
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "my_super_secret_jwt_key")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "554650690831-ng8bkdsjovkm155fr3hria02i2ju1lhm.apps.googleusercontent.com")


s3_client = boto3.client('s3')
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

os.makedirs("/tmp/uploads", exist_ok=True)

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory('/tmp/uploads', filename)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    gender = data.get('gender', '')
    date_of_birth = data.get('date_of_birth', None)
    
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'User already exists'}), 400
            
        hashed_password = generate_password_hash(password)
        cursor.execute(
            """INSERT INTO users (email, password_hash, first_name, last_name, gender, date_of_birth) 
               VALUES (%s, %s, %s, %s, %s, %s)""", 
            (email, hashed_password, first_name, last_name, gender, date_of_birth)
        )
        conn.commit()
        
        user_id = cursor.lastrowid
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({'token': token, 'user': {'id': user_id, 'email': email, 'first_name': first_name}})
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, email, password_hash FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user or not user[2] or not check_password_hash(user[2], password):
            return jsonify({'message': 'Invalid credentials'}), 401
            
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({'token': token, 'user': {'id': user[0], 'email': user[1]}})
    finally:
        cursor.close()
        conn.close()

@app.route('/auth/google', methods=['POST'])
def google_login():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'message': 'Token required'}), 400
        
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        google_id = idinfo['sub']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user:
            user_id = user[0]
            cursor.execute("UPDATE users SET google_id = %s WHERE id = %s", (google_id, user_id))
        else:
            cursor.execute("INSERT INTO users (email, google_id) VALUES (%s, %s)", (email, google_id))
            user_id = cursor.lastrowid
            
        conn.commit()
        
        jwt_token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({'token': jwt_token, 'user': {'id': user_id, 'email': email}})
        
    except ValueError as e:
        return jsonify({'message': f'Invalid token: {str(e)}'}), 401
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'message': 'If the email exists, a reset link has been sent.'})
            
        reset_token = str(uuid.uuid4())
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        cursor.execute("UPDATE users SET reset_token = %s, reset_token_expiry = %s WHERE id = %s", 
                       (reset_token, expiry.strftime('%Y-%m-%d %H:%M:%S'), user[0]))
        conn.commit()
        
        reset_link = f"http://localhost:5173/?reset_token={reset_token}"
        print(f"PASSWORD RESET LINK FOR {email}: {reset_link}")
        
        return jsonify({
            'message': 'Password reset link has been generated.',
            'reset_token': reset_token
        })
    finally:
        cursor.close()
        conn.close()

@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("SELECT id FROM users WHERE reset_token = %s AND reset_token_expiry > %s", (token, now_str))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'message': 'Invalid or expired token'}), 400
            
        hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s", 
                       (hashed_password, user[0]))
        conn.commit()
        
        return jsonify({'message': 'Password successfully reset'})
    finally:
        cursor.close()
        conn.close()

def get_db_connection():
    try:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            from urllib.parse import urlparse
            parsed = urlparse(database_url)
            conn = mysql.connector.connect(
                host=parsed.hostname,
                port=parsed.port or 3306,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path.lstrip('/')
            )
        else:
            conn = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 3306)),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME", "library_db")
            )
        return conn
    except Error as e:
        abort(500, description=f"Database connection failed: {str(e)}")

def row_to_book(row):
    return {
        "id":             row[0],
        "title":          row[1],
        "author":         row[2],
        "published_date": row[3],
        "location":       row[4],
        "isbn":           row[5],
        "is_favorite":    bool(row[6]),
        "is_read":        bool(row[7]),
        "is_reading":     bool(row[8]),
        "cover_image":    row[9],
        "added_date":     str(row[10]) if row[10] else None,
    }

@app.route('/books/', methods=['GET'])
@token_required
def get_books(current_user_id):
    search = request.args.get('search')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if search:
            like = f"%{search}%"
            cursor.execute(
                "SELECT * FROM books WHERE user_id = %s AND (title LIKE %s OR author LIKE %s) ORDER BY added_date DESC",
                (current_user_id, like, like)
            )
        else:
            cursor.execute("SELECT * FROM books WHERE user_id = %s ORDER BY added_date DESC", (current_user_id,))
        rows = cursor.fetchall()
        return jsonify([row_to_book(r) for r in rows])
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['GET'])
@token_required
def get_book(current_user_id, book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")
        return jsonify(row_to_book(row))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/', methods=['POST'])
@token_required
def add_book(current_user_id):
    title = request.form.get('title')
    author = request.form.get('author')
    published_date = request.form.get('published_date')
    location = request.form.get('location')
    isbn = request.form.get('isbn')
    is_favorite = request.form.get('is_favorite') == 'true'
    is_read = request.form.get('is_read') == 'true'
    
    cover_image = request.files.get('cover_image')
    cover_path = None
    if cover_image and cover_image.filename:
        ext = os.path.splitext(cover_image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        
        if S3_BUCKET_NAME:
            s3_client.upload_fileobj(
                cover_image,
                S3_BUCKET_NAME,
                filename,
                ExtraArgs={"ContentType": cover_image.content_type}
            )
            cover_path = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{filename}"
        else:
            filepath = os.path.join('/tmp/uploads', filename)
            cover_image.save(filepath)
            cover_path = f"/uploads/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO books (title, author, published_date, location, isbn,
                                  is_favorite, is_read, is_reading, cover_image, added_date, user_id)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (title, author, published_date, location, isbn,
             int(is_favorite), int(is_read), 0, cover_path,
             datetime.now().strftime("%Y-%m-%d %H:%M:%S"), current_user_id)
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM books WHERE id = %s", (new_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['PUT'])
@token_required
def edit_book(current_user_id, book_id):
    title = request.form.get('title')
    author = request.form.get('author')
    published_date = request.form.get('published_date')
    location = request.form.get('location')
    isbn = request.form.get('isbn')
    is_favorite = request.form.get('is_favorite') == 'true'
    is_read = request.form.get('is_read') == 'true'
    
    cover_image = request.files.get('cover_image')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT cover_image FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        cover_path = row[0]
        if cover_image and cover_image.filename:
            ext = os.path.splitext(cover_image.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            
            if S3_BUCKET_NAME:
                s3_client.upload_fileobj(
                    cover_image,
                    S3_BUCKET_NAME,
                    filename,
                    ExtraArgs={"ContentType": cover_image.content_type}
                )
                cover_path = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{filename}"
            else:
                filepath = os.path.join('/tmp/uploads', filename)
                cover_image.save(filepath)
                cover_path = f"/uploads/{filename}"

        cursor.execute(
            """UPDATE books SET title=%s, author=%s, published_date=%s, location=%s,
                               isbn=%s, is_favorite=%s, is_read=%s, cover_image=%s
               WHERE id=%s AND user_id=%s""",
            (title, author, published_date, location, isbn,
             int(is_favorite), int(is_read), cover_path, book_id, current_user_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['DELETE'])
@token_required
def delete_book(current_user_id, book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        conn.commit()
        return jsonify({"message": "Book deleted"})
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/favorite', methods=['PATCH'])
@token_required
def toggle_favorite(current_user_id, book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_favorite FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        new_val = 0 if row[0] else 1
        cursor.execute("UPDATE books SET is_favorite=%s WHERE id=%s AND user_id=%s", (new_val, book_id, current_user_id))
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/read', methods=['PATCH'])
@token_required
def toggle_read(current_user_id, book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_read FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        new_read = 0 if row[0] else 1
        new_reading = 0
        cursor.execute(
            "UPDATE books SET is_read=%s, is_reading=%s WHERE id=%s AND user_id=%s",
            (new_read, new_reading, book_id, current_user_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/status', methods=['PATCH'])
@token_required
def update_status(current_user_id, book_id):
    req = request.get_json()
    status = req.get('status')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM books WHERE id = %s AND user_id = %s", (book_id, current_user_id))
        if not cursor.fetchone():
            abort(404, description="Book not found")

        if status == "read":
            is_read, is_reading = 1, 0
        elif status == "reading":
            is_read, is_reading = 0, 1
        else:
            is_read, is_reading = 0, 0

        cursor.execute(
            "UPDATE books SET is_read=%s, is_reading=%s WHERE id=%s AND user_id=%s",
            (is_read, is_reading, book_id, current_user_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/stats/', methods=['GET'])
@token_required
def get_stats(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM books WHERE user_id = %s", (current_user_id,))
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_favorite = 1 AND user_id = %s", (current_user_id,))
        favorites = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_read = 1 AND user_id = %s", (current_user_id,))
        read = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_reading = 1 AND user_id = %s", (current_user_id,))
        reading = cursor.fetchone()[0]

        unread = total - read - reading
        return jsonify({"total": total, "favorites": favorites, "read": read, "unread": unread, "reading": reading})
    finally:
        cursor.close()
        conn.close()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

@app.route('/chat/', methods=['POST'])
@token_required
def chat_with_books(current_user_id):
    req = request.get_json()
    message = req.get('message', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM books WHERE user_id = %s", (current_user_id,))
        rows = cursor.fetchall()
        books = [row_to_book(r) for r in rows]
    finally:
        cursor.close()
        conn.close()

    if not books:
        books_str = "The library is currently empty."
    else:
        books_list = []
        for b in books:
            status = "Read" if b["is_read"] else ("Reading" if b["is_reading"] else "Unread")
            fav = " (Favorite)" if b["is_favorite"] else ""
            loc = f" Location: {b['location']}." if b["location"] else ""
            isbn_str = f" ISBN: {b['isbn']}." if b.get("isbn") else ""
            books_list.append(f"- '{b['title']}' by {b['author']}. Status: {status}.{fav}{loc}{isbn_str}")
        books_str = "\n".join(books_list)

    system_prompt = (
        f"You are a helpful AI assistant for a Personal Library manager. "
        f"Here is the list of books currently in the library:\n{books_str}\n"
        f"Answer the user's questions about their library based ONLY on this data. Be concise and friendly."
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.3,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None
        )
        return jsonify({"response": completion.choices[0].message.content})
    except Exception as e:
        abort(500, description=str(e))

handler = make_lambda_handler(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
