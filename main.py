from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import os
import shutil
import uuid
from datetime import datetime
import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://harshanth0112.github.io"
]}})

os.makedirs("uploads", exist_ok=True)

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory('uploads', filename)

def get_db_connection():
    try:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 5432)),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASSWORD", ""),
                dbname=os.getenv("DB_NAME", "library_db")
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
def get_books():
    search = request.args.get('search')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if search:
            like = f"%{search}%"
            cursor.execute(
                "SELECT * FROM books WHERE title LIKE %s OR author LIKE %s ORDER BY added_date DESC",
                (like, like)
            )
        else:
            cursor.execute("SELECT * FROM books ORDER BY added_date DESC")
        rows = cursor.fetchall()
        return jsonify([row_to_book(r) for r in rows])
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")
        return jsonify(row_to_book(row))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/', methods=['POST'])
def add_book():
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
        filepath = os.path.join('uploads', filename)
        cover_image.save(filepath)
        cover_path = f"/uploads/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO books (title, author, published_date, location, isbn,
                                  is_favorite, is_read, is_reading, cover_image, added_date)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (title, author, published_date, location, isbn,
             int(is_favorite), int(is_read), 0, cover_path,
             datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )
        conn.commit()
        new_id = cursor.fetchone()[0]
        cursor.execute("SELECT * FROM books WHERE id = %s", (new_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['PUT'])
def edit_book(book_id):
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
        cursor.execute("SELECT cover_image FROM books WHERE id = %s", (book_id,))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        cover_path = row[0]
        if cover_image and cover_image.filename:
            ext = os.path.splitext(cover_image.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            filepath = os.path.join('uploads', filename)
            cover_image.save(filepath)
            cover_path = f"/uploads/{filename}"

        cursor.execute(
            """UPDATE books SET title=%s, author=%s, published_date=%s, location=%s,
                               isbn=%s, is_favorite=%s, is_read=%s, cover_image=%s
               WHERE id=%s""",
            (title, author, published_date, location, isbn,
             int(is_favorite), int(is_read), cover_path, book_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
        conn.commit()
        return jsonify({"message": "Book deleted"})
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/favorite', methods=['PATCH'])
def toggle_favorite(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_favorite FROM books WHERE id = %s", (book_id,))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        new_val = 0 if row[0] else 1
        cursor.execute("UPDATE books SET is_favorite=%s WHERE id=%s", (new_val, book_id))
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/read', methods=['PATCH'])
def toggle_read(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_read FROM books WHERE id = %s", (book_id,))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Book not found")

        new_read = 0 if row[0] else 1
        new_reading = 0
        cursor.execute(
            "UPDATE books SET is_read=%s, is_reading=%s WHERE id=%s",
            (new_read, new_reading, book_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/books/<int:book_id>/status', methods=['PATCH'])
def update_status(book_id):
    req = request.get_json()
    status = req.get('status')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            abort(404, description="Book not found")

        if status == "read":
            is_read, is_reading = 1, 0
        elif status == "reading":
            is_read, is_reading = 0, 1
        else:
            is_read, is_reading = 0, 0

        cursor.execute(
            "UPDATE books SET is_read=%s, is_reading=%s WHERE id=%s",
            (is_read, is_reading, book_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        return jsonify(row_to_book(cursor.fetchone()))
    finally:
        cursor.close()
        conn.close()

@app.route('/stats/', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM books")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_favorite = 1")
        favorites = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_read = 1")
        read = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM books WHERE is_reading = 1")
        reading = cursor.fetchone()[0]

        unread = total - read - reading
        return jsonify({"total": total, "favorites": favorites, "read": read, "unread": unread, "reading": reading})
    finally:
        cursor.close()
        conn.close()

# ─────────────────────────────────────────────
# AI Chat
# ─────────────────────────────────────────────

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

@app.route('/chat/', methods=['POST'])
def chat_with_books():
    req = request.get_json()
    message = req.get('message', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM books")
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
