# 📚 Personal Library App

A full-stack personal library manager built with **Python (FastAPI)** + **React** + **SQLite**.

---

## 🚀 How to Run

### 1. Backend (Python FastAPI)

```bash
cd backend
pip install fastapi uvicorn python-multipart
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 2. Frontend (React)

```bash
cd frontend
npx create-react-app . --template minimal   # first time only
# Then replace src/ with the provided files
npm start
```

Frontend runs at: **http://localhost:3000**

---

## ✨ Features

| Feature | Description |
|---|---|
| ➕ Add Book | Title, Author, Published Date, Location, Cover Photo |
| ✏️ Edit Book | Edit any field including cover image |
| 🗑️ Delete Book | Remove a book with confirmation |
| ⭐ Favourites | Mark/unmark favourite, filter by it |
| ✅ Read/Unread | Toggle reading status, filter by it |
| 🔍 Search | Real-time search by title or author |
| 📊 Dashboard | Stats: Total, Favourites, Read, Unread |
| 🖼️ Cover Upload | Upload book cover images |
| 💾 SQLite DB | Persistent local database |

---

## 📁 Folder Structure

```
library-app/
├── backend/
│   ├── main.py          ← FastAPI app
│   ├── library.db       ← SQLite (auto-created)
│   └── uploads/         ← Cover images stored here
│
└── frontend/
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── Dashboard.js
            ├── BookList.js
            ├── BookForm.js
            └── SearchBar.js
```

---

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLite, SQLAlchemy
- **Frontend**: React, CSS (no external UI libraries)
- **Database**: SQLite (auto-created on first run)
