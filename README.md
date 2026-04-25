# 📚 AI-Powered Personal Library Manager

A full-stack web application to manage your personal book collection with an **AI-powered chatbot assistant** that understands your library and answers questions about your books in real time.

> Built with **React (Vite)** on the frontend and **Python (Flask)** on the backend, powered by **Aiven PostgreSQL** for cloud database storage and **Groq Cloud API (Llama 3.1)** for intelligent conversational AI.

---

## 🌐 Live Demo

| Layer | URL |
|---|---|
| **Frontend (UI)** | [https://harshanth0112.github.io/personal_library/](https://harshanth0112.github.io/personal_library/) |
| **Backend (API)** | [https://personal-library-2-il2n.onrender.com/](https://personal-library-2-il2n.onrender.com/) |

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Work Breakdown Structure (WBS)](#-work-breakdown-structure-wbs)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Step-by-Step Hosting Guide](#-step-by-step-hosting-guide)
  - [Database Hosting (Aiven PostgreSQL)](#step-1-database-hosting--aiven-postgresql)
  - [Backend Hosting (Render)](#step-2-backend-hosting--render)
  - [Frontend Hosting (GitHub Pages)](#step-3-frontend-hosting--github-pages)
- [AI Chatbot Integration](#-ai-chatbot-integration-end-to-end)
- [Local Setup](#-local-setup)
- [Author](#-author)

---

## ✨ Features

### 📖 Book Management (CRUD)
- **Add Books** — Title, Author, Published Date, Location/Shelf, ISBN, and Cover Image upload.
- **Edit Books** — Update any field, including replacing the cover image.
- **Delete Books** — Remove books with a confirmation dialog to prevent accidental deletion.

### 📊 Real-Time Dashboard
- Displays live statistics: **Total Books**, **Favourites**, **Currently Reading**, **Read**, and **Unread**.
- Each stat card is clickable and acts as a **filter** to show only matching books.

### 🔍 Smart Search
- Real-time search bar with **debounced input** (300ms delay) to search by **title** or **author**.
- Includes a clear button to reset the search instantly.

### ⭐ Favourites & Reading Status
- Toggle **Favourite** status with a star icon directly on each book card.
- Change reading status via a dropdown: **Unread → Reading → Read**.

### 🖼️ Cover Image Upload
- Upload book cover images during add/edit.
- Images are stored on the server and served via a static file route.
- A default placeholder image is shown when no cover is uploaded.

### 🤖 AI Chatbot Assistant
- A floating chat widget powered by **Groq Cloud API + Llama 3.1**.
- The chatbot is **context-aware** — it knows every book in your library and can answer questions like:
  - *"How many unread books do I have?"*
  - *"List all my favourite books."*
  - *"Recommend something from my library."*
- Includes a typing animation while the AI is generating a response.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Fast, modern UI framework with hot module reloading |
| **Styling** | Vanilla CSS | Custom responsive design without external UI libraries |
| **Backend** | Python + Flask | Lightweight REST API framework |
| **Database** | Aiven PostgreSQL (Cloud) | Managed cloud-hosted relational database |
| **AI Engine** | Groq Cloud API (Llama 3.1 8B) | Ultra-fast AI inference for the chatbot |
| **File Storage** | Local `/uploads` directory | Server-side storage for cover images |
| **Frontend Hosting** | GitHub Pages | Free static site hosting via `gh-pages` branch |
| **Backend Hosting** | Render.com | Free Python web service hosting with auto-deploy |
| **Database Hosting** | Aiven Cloud (DigitalOcean) | Free-tier managed PostgreSQL in the cloud |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│            (React App on GitHub Pages)                  │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Dashboard  │  │  BookList  │  │   ChatWidget       │ │
│  │ Component  │  │  Component │  │   (AI Assistant)   │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────┐  ┌────────────┐                         │
│  │  BookForm  │  │ SearchBar  │                         │
│  │  Component │  │ Component  │                         │
│  └────────────┘  └────────────┘                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP Requests (fetch API)
                        │ (GET, POST, PUT, PATCH, DELETE)
                        ▼
┌─────────────────────────────────────────────────────────┐
│          BACKEND SERVER (Render.com)                     │
│          Python Flask + Gunicorn                         │
│                                                         │
│  ┌───────────────────────────────────────────┐          │
│  │          REST API Endpoints               │          │
│  │   /books/    /stats/    /chat/            │          │
│  └──────────┬──────────────────┬─────────────┘          │
│             │                  │                         │
│             ▼                  ▼                         │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Aiven PostgreSQL│  │  Groq Cloud API  │             │
│  │  (Cloud Database)│  │  (Llama 3.1 LLM) │             │
│  │  DigitalOcean BLR│  │  AI Inference    │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### How the Data Flows:
1. **User opens the website** → React app loads from GitHub Pages (`gh-pages` branch).
2. **React calls `GET /books/`** → Flask connects to Aiven PostgreSQL and returns all books as JSON.
3. **User adds a book** → React sends `POST /books/` with FormData → Flask inserts a row into PostgreSQL + saves cover image.
4. **User asks the chatbot a question** → React sends `POST /chat/` → Flask queries all books from PostgreSQL, builds a context prompt, sends it to Groq API → Groq returns AI response → Flask sends it back to React → Chat bubble appears.

---

## 📊 Work Breakdown Structure (WBS)

```
Personal Library Project
│
├── 1.0 Database Layer
│   ├── 1.1 Setup Aiven PostgreSQL Instance (Cloud)
│   ├── 1.2 Create books table schema (setup_postgres.py)
│   ├── 1.3 Migrate data from local MySQL → Cloud PostgreSQL
│   └── 1.4 Configure DATABASE_URL in environment variables
│
├── 2.0 Backend Development (Flask API)
│   ├── 2.1 Framework: Migrated from FastAPI → Flask
│   ├── 2.2 Database Driver: psycopg2 for PostgreSQL
│   ├── 2.3 CORS Middleware: flask-cors
│   ├── 2.4 CRUD Routes: /books/ (GET, POST, PUT, DELETE)
│   ├── 2.5 Status Routes: /favorite, /read, /status (PATCH)
│   ├── 2.6 Statistics Route: /stats/ (GET)
│   ├── 2.7 AI Chat Route: /chat/ (POST) → Groq API
│   └── 2.8 File Upload: Cover images via /uploads/
│
├── 3.0 Frontend Development (React + Vite)
│   ├── 3.1 Dashboard Component (stats cards with filters)
│   ├── 3.2 BookList Component (card grid with actions)
│   ├── 3.3 BookForm Component (add/edit modal)
│   ├── 3.4 SearchBar Component (debounced search)
│   ├── 3.5 ChatWidget Component (AI chatbot UI)
│   ├── 3.6 Dynamic API URL (localhost vs production)
│   └── 3.7 Error Handling & Resilience
│
├── 4.0 Hosting & Cloud Infrastructure
│   ├── 4.1 Database: Aiven Cloud PostgreSQL (DigitalOcean BLR)
│   │   ├── Host: pg-25587f5b-personallibrary.c.aivencloud.com
│   │   ├── Port: 22555
│   │   ├── SSL Mode: require
│   │   └── Plan: 1 CPU / 1 GB RAM / 1 GB Storage
│   │
│   ├── 4.2 Backend API: Render.com (Web Service)
│   │   ├── URL: https://personal-library-2-il2n.onrender.com
│   │   ├── Runtime: Python 3
│   │   ├── Build: pip install -r requirements.txt
│   │   ├── Start: gunicorn main:app
│   │   └── Env Vars: DATABASE_URL, GROQ_API_KEY
│   │
│   └── 4.3 Frontend UI: GitHub Pages
│       ├── URL: https://harshanth0112.github.io/personal_library/
│       ├── Branch: gh-pages (auto-generated by npm run deploy)
│       └── Tool: gh-pages npm package
│
└── 5.0 AI Chat Integration
    ├── 5.1 AI Provider: Groq Cloud (free tier)
    ├── 5.2 Model: Llama 3.1 8B Instant
    ├── 5.3 Context-Aware Prompts (reads all books from DB)
    └── 5.4 Frontend Chat UI with typing animation
```

---

## 📁 Project Structure

```
personal_library/
│
├── main.py                          ← Flask backend (all API endpoints)
├── setup_postgres.py                ← Script to create PostgreSQL table
├── requirements.txt                 ← Python dependencies
├── .env                             ← Secret keys & DATABASE_URL (NOT in GitHub)
├── .gitignore                       ← Files/folders excluded from Git
├── README.md                        ← This file
│
├── uploads/                         ← Uploaded book cover images
│
└── frontend/                        ← React application
    ├── index.html                   ← HTML entry point
    ├── package.json                 ← Node.js dependencies & scripts
    ├── vite.config.js               ← Vite build configuration
    │
    ├── public/
    │   ├── favicon.svg              ← Browser tab icon
    │   └── icons.svg                ← SVG icon sprites
    │
    └── src/
        ├── main.jsx                 ← React entry point
        ├── App.jsx                  ← Root component (state management)
        ├── App.css                  ← Global styles
        ├── index.css                ← Base/reset styles
        │
        ├── assets/
        │   └── book.webp            ← Default book cover placeholder
        │
        └── components/
            ├── Dashboard.jsx        ← Stats cards (Total, Favorites, Read, etc.)
            ├── BookList.jsx         ← Book grid with individual BookCard components
            ├── BookForm.jsx         ← Add/Edit book modal form
            ├── SearchBar.jsx        ← Search input with debounce
            ├── ChatWidget.jsx       ← AI chatbot floating widget
            └── ChatWidget.css       ← Chatbot-specific styles
```

---

## 📡 API Endpoints

All endpoints are served from the Flask backend.

### Books CRUD

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/books/` | Get all books (optional `?search=query` parameter) |
| `GET` | `/books/{id}` | Get a single book by ID |
| `POST` | `/books/` | Add a new book (multipart form data with optional cover image) |
| `PUT` | `/books/{id}` | Update an existing book |
| `DELETE` | `/books/{id}` | Delete a book |

### Book Status

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/books/{id}/favorite` | Toggle favourite status |
| `PATCH` | `/books/{id}/read` | Toggle read/unread status |
| `PATCH` | `/books/{id}/status` | Set status to `read`, `reading`, or `unread` |

### Statistics & AI

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats/` | Get library statistics (total, favorites, read, unread, reading) |
| `POST` | `/chat/` | Send a message to the AI chatbot (JSON body: `{"message": "..."}`) |

---

## 🚀 Step-by-Step Hosting Guide

This section explains **exactly** how the application is hosted across three cloud services, and how they connect to each other.

### Step 1: Database Hosting — Aiven PostgreSQL

**What is Aiven?**
Aiven is a managed cloud database platform. It hosts a **PostgreSQL database** on DigitalOcean servers so you don't need to run a database on your own computer.

**Setup Process:**

1. **Create a free account** at [https://console.aiven.io](https://console.aiven.io).
2. **Create a new PostgreSQL service**:
   - Cloud Provider: **DigitalOcean**
   - Region: **Bangalore (do-blr1)**
   - Plan: **Free / Hobbyist** (1 CPU, 1 GB RAM, 1 GB Storage)
3. **Wait for the service to start** (takes ~2 minutes).
4. **Get the connection details** from the Aiven dashboard:
   ```
   Host:     pg-25587f5b-personallibrary.c.aivencloud.com
   Port:     22555
   User:     avnadmin
   Password: ********** (from Aiven dashboard)
   Database: defaultdb
   SSL Mode: require
   ```
5. **Copy the Service URI** — this is the full connection string:
   ```
   postgres://avnadmin:<password>@pg-25587f5b-personallibrary.c.aivencloud.com:22555/defaultdb?sslmode=require
   ```
6. **Create the `books` table** by running `setup_postgres.py`:
   ```bash
   python setup_postgres.py
   ```
   This creates the table with the following schema:
   ```sql
   CREATE TABLE IF NOT EXISTS books (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       author VARCHAR(255) NOT NULL,
       published_date VARCHAR(100),
       location VARCHAR(255),
       isbn VARCHAR(50),
       is_favorite SMALLINT DEFAULT 0,
       is_read SMALLINT DEFAULT 0,
       is_reading SMALLINT DEFAULT 0,
       cover_image VARCHAR(500),
       added_date TIMESTAMP
   );
   ```

**Result:** Your database is now live in the cloud. Any application with the `DATABASE_URL` can connect to it from anywhere in the world.

---

### Step 2: Backend Hosting — Render

**What is Render?**
Render is a cloud platform that runs your Python Flask server 24/7 so users can access the API without your computer being turned on.

**Setup Process:**

1. **Push your code to GitHub** (the `main` branch):
   ```bash
   git add .
   git commit -m "Deploy Flask backend"
   git push origin main
   ```

2. **Sign up at [Render.com](https://render.com)** using your GitHub account.

3. **Create a New Web Service:**
   - Click **"New" → "Web Service"**.
   - Connect your GitHub repository: `harshanth0112/personal_library`.
   - Select the `main` branch.

4. **Configure the service:**

   | Setting | Value |
   |---|---|
   | **Name** | `personal-library-2` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn main:app` |

5. **Add Environment Variables** (under the "Environment" tab):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `postgres://avnadmin:<password>@pg-25587f5b-personallibrary.c.aivencloud.com:22555/defaultdb?sslmode=require` |
   | `GROQ_API_KEY` | `gsk_your_groq_api_key_here` |

   > ⚠️ **Important:** Replace `<password>` with the actual password from your Aiven dashboard. These variables are kept secret by Render and are never exposed publicly.

6. **Click "Create Web Service"** and wait for deployment (~2–5 minutes).

**How it works internally:**
- When Render starts, it runs `pip install -r requirements.txt` to install Flask, psycopg2, Groq, etc.
- Then it runs `gunicorn main:app` to start the Flask server.
- Flask reads `DATABASE_URL` from the environment and connects to your Aiven PostgreSQL database.
- The API is now live at: `https://personal-library-2-il2n.onrender.com`

**Auto-Deploy:** Every time you `git push` to the `main` branch on GitHub, Render automatically detects the change and re-deploys your backend.

---

### Step 3: Frontend Hosting — GitHub Pages

**What is GitHub Pages?**
GitHub Pages hosts static websites (HTML/CSS/JS) directly from a GitHub repository branch, completely free.

**Setup Process:**

1. **Install the deployment tool** (already done):
   ```bash
   cd frontend
   npm install gh-pages --save-dev
   ```

2. **Configure `vite.config.js`** to set the base path:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/personal_library/',
   })
   ```

3. **Configure `package.json`** with the homepage and deploy scripts:
   ```json
   {
     "homepage": "https://harshanth0112.github.io/personal_library",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Configure dynamic API URL** in `App.jsx`:
   ```javascript
   const API = import.meta.env.DEV
     ? 'http://127.0.0.1:8000'
     : 'https://personal-library-2-il2n.onrender.com';
   ```
   - When running locally (`npm run dev`), it connects to `localhost:8000`.
   - When deployed to GitHub Pages, it connects to the Render backend.

5. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```
   This command:
   - Runs `npm run build` (compiles React into static HTML/CSS/JS in the `dist/` folder).
   - Pushes the `dist/` folder to a special `gh-pages` branch on GitHub.
   - GitHub automatically serves the contents of `gh-pages` at: `https://harshanth0112.github.io/personal_library/`

**Result:** Your React app is now live. Every time you change the frontend, run `npm run deploy` again to update it.

---

### How All Three Services Connect

```
┌──────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA FLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User visits: harshanth0112.github.io/personal_library/  │
│     └── GitHub Pages serves the React app (static files)     │
│                                                              │
│  2. React app calls: personal-library-2-il2n.onrender.com   │
│     └── Render runs the Flask API server                     │
│                                                              │
│  3. Flask connects to: pg-25587f5b-...aivencloud.com:22555  │
│     └── Aiven hosts the PostgreSQL database                  │
│                                                              │
│  4. Flask also calls: api.groq.com                           │
│     └── Groq runs the Llama 3.1 AI model                    │
│                                                              │
│  5. Data flows back: Groq → Flask → React → User            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### CORS Configuration
The Flask backend must allow requests from the GitHub Pages domain. This is configured in `main.py`:
```python
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://harshanth0112.github.io"
]}})
```

---

## 🤖 AI Chatbot Integration (End-to-End)

### Step 1: Setting Up the AI Provider (Groq Cloud)

**Why Groq?** Groq provides extremely fast AI inference and has a generous free tier. We use the **Llama 3.1 8B Instant** model.

1. Created a free account at [https://console.groq.com](https://console.groq.com).
2. Generated an API key from the Groq dashboard.
3. Stored the API key securely in a `.env` file:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```

### Step 2: Backend — The `/chat/` Endpoint

The chatbot endpoint reads all books from the database, formats them into a context-aware prompt, and sends it to the Groq API:

```python
@app.route('/chat/', methods=['POST'])
def chat_with_books():
    req = request.get_json()
    message = req.get('message', '')

    # 1. Query all books from PostgreSQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books")
    books = [row_to_book(r) for r in cursor.fetchall()]

    # 2. Build context-aware system prompt
    system_prompt = (
        "You are a helpful AI assistant for a Personal Library manager. "
        f"Here is the list of books:\n{formatted_books}\n"
        "Answer based ONLY on this data."
    )

    # 3. Send to Groq API
    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
    )
    return jsonify({"response": completion.choices[0].message.content})
```

### Step 3: Frontend — ChatWidget Component

A floating chat widget (`ChatWidget.jsx`) with:
- **Floating Action Button** — `💬` button fixed to the bottom-right corner.
- **Chat Window** — Opens with a slide-up animation.
- **Typing Indicator** — Three animated dots shown while waiting for AI response.
- **Auto-scroll** — Automatically scrolls to the latest message.

### Complete Chat Data Flow

```
User types: "What are my favourite books?"
        │
        ▼
[ChatWidget.jsx] ──POST /chat/──► [Flask /chat/ endpoint]
                                        │
                                        ▼
                                  Queries PostgreSQL (Aiven)
                                  Formats all books into text
                                  Builds system prompt
                                        │
                                        ▼
                                  Sends to Groq Cloud API:
                                  - System: "Here are the books: ..."
                                  - User: "What are my favourite books?"
                                        │
                                        ▼
                                  Groq (Llama 3.1) generates response
                                        │
                                        ▼
[ChatWidget.jsx] ◄──JSON response── [Flask returns {"response": "..."}]
        │
        ▼
Chat bubble appears with AI answer
```

---

## 💻 How to Run This Code (Step by Step)

### Prerequisites

Before you begin, make sure you have the following installed on your computer:

| Tool | Version | Download Link |
|---|---|---|
| **Python** | 3.10 or higher | [https://www.python.org/downloads/](https://www.python.org/downloads/) |
| **Node.js** | 18 or higher | [https://nodejs.org/](https://nodejs.org/) |
| **npm** | Comes with Node.js | Installed automatically with Node.js |
| **Git** | Any recent version | [https://git-scm.com/downloads](https://git-scm.com/downloads) |

You will also need:
- A free **Groq API Key** from [https://console.groq.com](https://console.groq.com)
- A free **Aiven PostgreSQL** database from [https://console.aiven.io](https://console.aiven.io) (or use your own PostgreSQL instance)

---

### Step 1: Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/harshanth0112/personal_library.git
cd personal_library
```

---

### Step 2: Create a Python Virtual Environment

A virtual environment keeps your project's dependencies separate from your system Python.

**Windows:**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

> ✅ You should see `(.venv)` at the beginning of your terminal prompt. This means the virtual environment is active.

---

### Step 3: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

This installs: `flask`, `flask-cors`, `psycopg2-binary`, `groq`, `python-dotenv`, `gunicorn`, and `pydantic`.

---

### Step 4: Create the `.env` File

Create a file named `.env` in the root of the project (same folder as `main.py`):

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@pg-25587f5b-personallibrary.c.aivencloud.com:22555/defaultdb?sslmode=require
```

> ⚠️ **Replace** `gsk_your_groq_api_key_here` with your real Groq API key.  
> ⚠️ **Replace** `YOUR_PASSWORD` with your real Aiven database password.  
> ⚠️ This file is listed in `.gitignore` and will **never** be pushed to GitHub.

---

### Step 5: Setup the Database Table

Run the database setup script to create the `books` table in your PostgreSQL database:

```bash
python setup_postgres.py
```

**Expected output:**
```
Creating 'books' table in PostgreSQL...
✅ PostgreSQL table 'books' is ready!
```

> If you see `❌ DATABASE_URL not found in .env`, make sure your `.env` file is saved correctly in the project root folder.

---

### Step 6: Start the Backend Server

```bash
python main.py
```

**Expected output:**
```
 * Serving Flask app 'main'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:8000
Press CTRL+C to quit
```

> ✅ Your backend API is now running at **http://127.0.0.1:8000**  
> 🧪 Test it by opening `http://127.0.0.1:8000/stats/` in your browser — you should see JSON data.

**Keep this terminal window open!** The server must stay running while you use the app.

---

### Step 7: Install Frontend Dependencies

Open a **new terminal window** (keep the backend running in the first one), then:

```bash
cd frontend
npm install
```

This downloads all Node.js packages (React, Vite, etc.) into the `node_modules/` folder.

---

### Step 8: Start the Frontend Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v8.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/personal_library/
  ➜  Network: http://10.x.x.x:5173/personal_library/
```

> ✅ Open **http://localhost:5173/personal_library/** in your browser.  
> The React app will automatically connect to your local Flask backend at `http://127.0.0.1:8000`.

---

### Step 9: Verify Everything Works

| Check | How to Test | Expected Result |
|---|---|---|
| **Backend is running** | Visit `http://127.0.0.1:8000/stats/` | JSON response: `{"total":0,"favorites":0,...}` |
| **Frontend loads** | Visit `http://localhost:5173/personal_library/` | Dashboard with stats cards appears |
| **Add a book** | Click "+ Add Book" and fill the form | Book appears in the list |
| **AI Chatbot** | Click the 💬 button, type "How many books do I have?" | AI responds with the count |
| **Search** | Type a book title in the search bar | Books filter in real-time |

---

### Quick Reference: Common Commands

| Action | Command | Terminal |
|---|---|---|
| **Start backend** | `python main.py` | Terminal 1 (project root) |
| **Start frontend** | `npm run dev` | Terminal 2 (`frontend/` folder) |
| **Stop a server** | `Ctrl + C` | In the running terminal |
| **Deploy frontend** | `npm run deploy` | Terminal 2 (`frontend/` folder) |
| **Install new Python package** | `pip install <package>` | Terminal 1 (with `.venv` active) |
| **Activate virtual env (Windows)** | `.venv\Scripts\activate` | Terminal 1 |
| **Deactivate virtual env** | `deactivate` | Terminal 1 |

---

### Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'flask'` | Make sure your virtual environment is active: `.venv\Scripts\activate` |
| `500 Internal Server Error` on all routes | Check your `.env` file — the `DATABASE_URL` password is probably wrong |
| Frontend shows blank white page | The backend server is not running — start it with `python main.py` |
| `CORS error` in browser console | Make sure your GitHub Pages URL is listed in the `CORS` config in `main.py` |
| `npm run dev` says port in use | Another server is already running on port 5173 — close it first |

---

## 👤 Author

**Harshanth**
- GitHub: [@harshanth0112](https://github.com/harshanth0112)

---

## 📄 License

This project is open source and available for educational purposes.
