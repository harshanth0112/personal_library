# 📚 AI-Powered Personal Library Manager

A full-stack web application to manage your personal book collection with an **AI-powered chatbot assistant** that understands your library and answers questions about your books in real time.

> Built with **React (Vite)** on the frontend and **Python (FastAPI)** on the backend, integrated with the **Groq Cloud API (Llama 3.1)** for intelligent conversational AI.

---

## 🌐 Live Demo

| Layer | URL |
|---|---|
| **Frontend** | [https://harshanth0112.github.io/personal_library/](https://harshanth0112.github.io/personal_library/) |
| **Backend API** | [https://personal-library-wjbp.onrender.com/](https://personal-library-wjbp.onrender.com/) |
| **API Docs (Swagger)** | [https://personal-library-wjbp.onrender.com/docs](https://personal-library-wjbp.onrender.com/docs) |

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [AI Chatbot Integration (End-to-End)](#-ai-chatbot-integration-end-to-end)
- [Local Setup](#-local-setup)
- [Deployment Guide](#-deployment-guide)
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
| **Backend** | Python + FastAPI | High-performance async REST API |
| **AI Engine** | Groq Cloud API (Llama 3.1 8B) | Ultra-fast AI inference for the chatbot |
| **Database** | JSON file (`library.json`) | Lightweight, file-based persistence |
| **File Storage** | Local `/uploads` directory | Server-side storage for cover images |
| **Frontend Hosting** | GitHub Pages | Free static site hosting |
| **Backend Hosting** | Render.com | Free Python web service hosting |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────┐
│         USER'S BROWSER          │
│  (React App on GitHub Pages)    │
│                                 │
│  ┌───────────┐ ┌──────────────┐ │
│  │ Dashboard │ │  BookList    │ │
│  │ Component │ │  Component   │ │
│  └───────────┘ └──────────────┘ │
│  ┌───────────┐ ┌──────────────┐ │
│  │ BookForm  │ │  SearchBar   │ │
│  │ Component │ │  Component   │ │
│  └───────────┘ └──────────────┘ │
│  ┌──────────────────────────────┐│
│  │     ChatWidget Component    ││
│  │   (Floating AI Assistant)   ││
│  └──────────────────────────────┘│
└──────────────┬──────────────────┘
               │ HTTP Requests (fetch API)
               │ (GET, POST, PUT, PATCH, DELETE)
               ▼
┌─────────────────────────────────┐
│     BACKEND SERVER (Render)     │
│     Python FastAPI + Uvicorn    │
│                                 │
│  ┌────────────────────────────┐ │
│  │   REST API Endpoints      │ │
│  │  /books/  /stats/  /chat/ │ │
│  └─────────┬──────────────────┘ │
│            │                    │
│  ┌─────────▼────────┐          │
│  │  library.json     │          │
│  │  (Book Database)  │          │
│  └──────────────────┘          │
│            │                    │
│  ┌─────────▼────────┐          │
│  │   Groq Cloud API  │          │
│  │ (Llama 3.1 Model) │          │
│  └──────────────────┘          │
└─────────────────────────────────┘
```

### How the Data Flows:
1. **User opens the website** → React app loads from GitHub Pages.
2. **React calls `GET /books/`** → FastAPI reads `library.json` and returns all books.
3. **User adds a book** → React sends `POST /books/` with FormData → FastAPI saves to JSON + uploads cover image.
4. **User asks the chatbot a question** → React sends `POST /chat/` → FastAPI fetches all books, builds a context prompt, sends it to Groq API → Groq returns AI response → FastAPI sends it back to React → Chat bubble appears.

---

## 📁 Project Structure

```
personal_library/
│
├── main.py                          ← FastAPI backend (all API endpoints)
├── requirements.txt                 ← Python dependencies
├── library.json                     ← JSON database (auto-created)
├── .env                             ← Secret API keys (NOT uploaded to GitHub)
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
        ├── App.jsx                  ← Root component (state management + routing)
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

All endpoints are served from the FastAPI backend.

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

## 🤖 AI Chatbot Integration (End-to-End)

This is a detailed breakdown of how the AI chatbot was built and integrated into the project, from backend to frontend.

### Step 1: Setting Up the AI Provider (Groq Cloud)

**Why Groq?** Groq provides extremely fast AI inference (much faster than OpenAI for simple queries) and has a generous free tier. We use the **Llama 3.1 8B Instant** model.

1. Created a free account at [https://console.groq.com](https://console.groq.com).
2. Generated an API key from the Groq dashboard.
3. Stored the API key securely in a `.env` file:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```
4. Installed the Groq Python SDK:
   ```bash
   pip install groq python-dotenv
   ```

### Step 2: Backend — Creating the `/chat/` Endpoint

**File: `main.py`**

The chatbot endpoint is the core of the AI integration. Here is exactly what happens when a user sends a message:

#### 2.1 — Load the API Key and Initialize the Client
```python
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # Reads .env file and loads GROQ_API_KEY

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
```

#### 2.2 — Define the Request Model
```python
class ChatRequest(BaseModel):
    message: str  # The user's question (e.g., "How many books do I have?")
```

#### 2.3 — Build the Context-Aware System Prompt
This is the **key innovation**. Instead of sending just the user's question to the AI, we first read the entire library database and include it as context in the system prompt. This makes the AI "aware" of the user's specific books.

```python
@app.post("/chat/")
def chat_with_books(req: ChatRequest):
    # Step A: Read all books from the database
    with db_lock:
        books = read_db()

    # Step B: Format each book into a readable string
    if not books:
        books_str = "The library is currently empty."
    else:
        books_list = []
        for b in books:
            status = "Read" if b["is_read"] else "Unread"
            fav = " (Favorite)" if b["is_favorite"] else ""
            loc = f" Location: {b['location']}." if b["location"] else ""
            isbn_str = f" ISBN: {b.get('isbn')}." if b.get('isbn') else ""
            books_list.append(
                f"- '{b['title']}' by {b['author']}. Status: {status}.{fav}{loc}{isbn_str}"
            )
        books_str = "\n".join(books_list)

    # Step C: Create the system prompt with library context
    system_prompt = (
        f"You are a helpful AI assistant for a Personal Library manager. "
        f"Here is the list of books currently in the library:\n{books_str}\n"
        f"Answer the user's questions about their library based ONLY on this data. "
        f"Be concise and friendly."
    )
```

**Example system prompt sent to the AI:**
```
You are a helpful AI assistant for a Personal Library manager.
Here is the list of books currently in the library:
- 'The Great Gatsby' by F. Scott Fitzgerald. Status: Read. (Favorite) Location: Bedroom shelf.
- 'To Kill a Mockingbird' by Harper Lee. Status: Unread. Location: Box 2.
- '1984' by George Orwell. Status: Read.
Answer the user's questions about their library based ONLY on this data. Be concise and friendly.
```

#### 2.4 — Call the Groq API
```python
    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",    # Fast, lightweight model
        messages=[
            {"role": "system", "content": system_prompt},  # Library context
            {"role": "user", "content": req.message}        # User's question
        ],
        temperature=0.3,   # Low temperature = more factual, less creative
        max_tokens=1024,   # Maximum response length
        top_p=1,
        stream=False,      # Wait for full response (not streaming)
        stop=None
    )
    return {"response": completion.choices[0].message.content}
```

#### 2.5 — Error Handling
```python
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 3: Frontend — Building the Chat Widget

**File: `frontend/src/components/ChatWidget.jsx`**

The frontend chat widget is a self-contained React component with its own state management and styling.

#### 3.1 — Component State
```jsx
const [isOpen, setIsOpen] = useState(false);       // Controls visibility of chat window
const [messages, setMessages] = useState([         // Chat history array
  { role: 'assistant', content: 'Hi there! Ask me anything about your book library.' }
]);
const [input, setInput] = useState('');             // Current input text
const [isLoading, setIsLoading] = useState(false);  // Loading state for typing animation
const messagesEndRef = useRef(null);                // Ref for auto-scrolling
```

#### 3.2 — Sending a Message to the Backend
When the user types a question and clicks "Send":
```jsx
const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // 1. Add user message to chat history immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);  // Show typing animation

    try {
      // 2. Send message to backend /chat/ endpoint
      const res = await fetch(`${API}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();

      // 3. Add AI response to chat history
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      // 4. Show error message if something goes wrong
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI.'
      }]);
    } finally {
      setIsLoading(false);  // Hide typing animation
    }
};
```

#### 3.3 — Auto-Scroll to Latest Message
```jsx
const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
    scrollToBottom();
}, [messages]);  // Triggered every time a new message is added
```

#### 3.4 — UI Structure
- **Floating Action Button (FAB)**: A `💬` button fixed to the bottom-right corner.
- **Chat Window**: Opens with a slide-up animation, contains:
  - **Header** — Title "Library AI Assistant" + close button.
  - **Message Area** — Scrollable list of chat bubbles (user = indigo, assistant = gray).
  - **Typing Indicator** — Three animated dots shown while waiting for AI response.
  - **Input Form** — Text input + Send button.

### Step 4: Styling the Chat Widget

**File: `frontend/src/components/ChatWidget.css`**

Key design decisions:
- **Fixed positioning** (`position: fixed; bottom: 24px; right: 24px`) — Always visible.
- **Slide-up animation** — Chat window smoothly appears using CSS `@keyframes slideUp`.
- **Typing dots animation** — Three dots scale up/down in sequence using CSS `@keyframes typing`.
- **Responsive** — `max-width: calc(100vw - 48px)` ensures it works on mobile screens.

### Step 5: Connecting Everything

**File: `frontend/src/App.jsx`**

The `ChatWidget` is imported and rendered at the root level of the app, so it appears on every page:
```jsx
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <div className="app">
      {/* ... Dashboard, BookList, etc. ... */}
      <ChatWidget />   {/* ← Floating chat widget, always present */}
    </div>
  );
}
```

### Complete Data Flow Summary

```
User types: "What are my favourite books?"
        │
        ▼
[ChatWidget.jsx] ──POST /chat/──► [main.py /chat/ endpoint]
                                        │
                                        ▼
                                  Reads library.json
                                  Formats all books into text
                                  Builds system prompt with book data
                                        │
                                        ▼
                                  Sends to Groq Cloud API:
                                  - System: "Here are the books: ..."
                                  - User: "What are my favourite books?"
                                        │
                                        ▼
                                  Groq (Llama 3.1) generates response:
                                  "You have 2 favourite books:
                                   1. The Great Gatsby by F. Scott Fitzgerald
                                   2. 1984 by George Orwell"
                                        │
                                        ▼
[ChatWidget.jsx] ◄──JSON response── [main.py returns {"response": "..."}]
        │
        ▼
Chat bubble appears with AI response
```

---

## 💻 Local Setup

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- A free **Groq API Key** from [https://console.groq.com](https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/harshanth0112/personal_library.git
cd personal_library
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo GROQ_API_KEY=your_groq_api_key_here > .env

# Start the backend server
uvicorn main:app --reload
```
The backend will run at: **http://localhost:8000**
Interactive API docs at: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
The frontend will run at: **http://localhost:5173**

> **Note:** For local development, update the `API` constant in the frontend files to `http://localhost:8000`.

---

## 🌍 Deployment Guide

### Backend → Render.com (Free)
1. Push your code to GitHub.
2. Sign up at [Render.com](https://render.com) using your GitHub account.
3. Create a **New Web Service** → Connect your `personal_library` repository.
4. Configure:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add **Environment Variable:** `GROQ_API_KEY` = your API key.
6. Click **Create Web Service** and wait for deployment.

### Frontend → GitHub Pages (Free)
1. Install the deploy tool:
   ```bash
   cd frontend
   npm install gh-pages --save-dev
   ```
2. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/personal_library/',
   })
   ```
3. Update `package.json`:
   ```json
   "homepage": "https://harshanth0112.github.io/personal_library",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```

### CORS Configuration
The backend must allow requests from your GitHub Pages domain. In `main.py`:
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://harshanth0112.github.io"
],
```

---

## 👤 Author

**Harshanth**
- GitHub: [@harshanth0112](https://github.com/harshanth0112)


---

## 📄 License

This project is open source and available for educational purposes.
