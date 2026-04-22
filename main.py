from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
import os
import shutil
import uuid
import json
import threading
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Personal Library API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

DATA_FILE = "library.json"
db_lock = threading.Lock()

def read_db():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def write_db(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    message: str

class StatusUpdate(BaseModel):
    status: str

@app.get("/books/")
def get_books(search: Optional[str] = None):
    with db_lock:
        books = read_db()
    
    if search:
        search_lower = search.lower()
        books = [b for b in books if search_lower in b["title"].lower() or search_lower in b["author"].lower()]
        
    books.sort(key=lambda x: x["added_date"], reverse=True)
    return books

@app.get("/books/{book_id}")
def get_book(book_id: int):
    with db_lock:
        books = read_db()
        
    for b in books:
        if b["id"] == book_id:
            return b
            
    raise HTTPException(status_code=404, detail="Book not found")

@app.post("/books/")
async def add_book(
    title: str = Form(...),
    author: str = Form(...),
    published_date: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    isbn: Optional[str] = Form(None),
    is_favorite: bool = Form(False),
    is_read: bool = Form(False),
    cover_image: Optional[UploadFile] = File(None)
):
    cover_path = None
    if cover_image and cover_image.filename:
        ext = os.path.splitext(cover_image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = f"uploads/{filename}"
        with open(filepath, "wb") as f:
            shutil.copyfileobj(cover_image.file, f)
        cover_path = f"/uploads/{filename}"

    added_date = datetime.now().isoformat()
    
    with db_lock:
        books = read_db()
        new_id = max([b["id"] for b in books], default=0) + 1
        
        new_book = {
            "id": new_id,
            "title": title,
            "author": author,
            "added_date": added_date,
            "published_date": published_date,
            "location": location,
            "isbn": isbn,
            "is_favorite": is_favorite,
            "is_read": is_read,
            "cover_image": cover_path
        }
        books.append(new_book)
        write_db(books)
        
    return new_book

@app.put("/books/{book_id}")
async def edit_book(
    book_id: int,
    title: str = Form(...),
    author: str = Form(...),
    published_date: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    isbn: Optional[str] = Form(None),
    is_favorite: bool = Form(False),
    is_read: bool = Form(False),
    cover_image: Optional[UploadFile] = File(None)
):
    with db_lock:
        books = read_db()
        target_idx = next((i for i, b in enumerate(books) if b["id"] == book_id), None)
        
        if target_idx is None:
            raise HTTPException(status_code=404, detail="Book not found")
            
        cover_path = books[target_idx]["cover_image"]
        if cover_image and cover_image.filename:
            ext = os.path.splitext(cover_image.filename)[1]
            filename = f"{uuid.uuid4()}{ext}"
            filepath = f"uploads/{filename}"
            with open(filepath, "wb") as f:
                shutil.copyfileobj(cover_image.file, f)
            cover_path = f"/uploads/{filename}"

        books[target_idx].update({
            "title": title,
            "author": author,
            "published_date": published_date,
            "location": location,
            "isbn": isbn,
            "is_favorite": is_favorite,
            "is_read": is_read,
            "cover_image": cover_path
        })
        write_db(books)
        updated_book = books[target_idx]
        
    return updated_book

@app.delete("/books/{book_id}")
def delete_book(book_id: int):
    with db_lock:
        books = read_db()
        initial_len = len(books)
        books = [b for b in books if b["id"] != book_id]
        
        if len(books) != initial_len:
            write_db(books)
        
    return {"message": "Book deleted"}

@app.patch("/books/{book_id}/favorite")
def toggle_favorite(book_id: int):
    with db_lock:
        books = read_db()
        target = next((b for b in books if b["id"] == book_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Book not found")
            
        target["is_favorite"] = not target["is_favorite"]
        write_db(books)
        updated_book = target
        
    return updated_book

@app.patch("/books/{book_id}/read")
def toggle_read(book_id: int):
    with db_lock:
        books = read_db()
        target = next((b for b in books if b["id"] == book_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Book not found")
            
        target["is_read"] = not target["is_read"]
        if target["is_read"]:
            target["is_reading"] = False
        write_db(books)
        updated_book = target
        
    return updated_book

@app.patch("/books/{book_id}/status")
def update_status(book_id: int, req: StatusUpdate):
    with db_lock:
        books = read_db()
        target = next((b for b in books if b["id"] == book_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Book not found")
            
        if req.status == "read":
            target["is_read"] = True
            target["is_reading"] = False
        elif req.status == "reading":
            target["is_read"] = False
            target["is_reading"] = True
        else: # unread
            target["is_read"] = False
            target["is_reading"] = False
            
        write_db(books)
        return target

@app.get("/stats/")
def get_stats():
    with db_lock:
        books = read_db()
        
    total = len(books)
    favorites = sum(1 for b in books if b["is_favorite"])
    read = sum(1 for b in books if b["is_read"])
    reading = sum(1 for b in books if b.get("is_reading"))
    
    unread = total - read - reading
    return {"total": total, "favorites": favorites, "read": read, "unread": unread, "reading": reading}

@app.post("/chat/")
def chat_with_books(req: ChatRequest):
    with db_lock:
        books = read_db()

    if not books:
        books_str = "The library is currently empty."
    else:
        books_list = []
        for b in books:
            status = "Read" if b["is_read"] else "Unread"
            fav = " (Favorite)" if b["is_favorite"] else ""
            loc = f" Location: {b['location']}." if b["location"] else ""
            isbn_str = f" ISBN: {b.get('isbn')}." if b.get('isbn') else ""
            books_list.append(f"- '{b['title']}' by {b['author']}. Status: {status}.{fav}{loc}{isbn_str}")
        books_str = "\n".join(books_list)

    system_prompt = f"You are a helpful AI assistant for a Personal Library manager. Here is the list of books currently in the library:\n{books_str}\nAnswer the user's questions about their library based ONLY on this data. Be concise and friendly."

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            temperature=0.3,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
