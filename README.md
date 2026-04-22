# 📚 AI-Powered Personal Library Manager

A modern, full-stack application to manage your personal book collection, featuring a real-time dashboard and an **AI-powered assistant** to help you manage your library.

---

## 🚀 Live Demo
- **Frontend:** [https://harshanth0112.github.io/personal_library/](https://harshanth0112.github.io/personal_library/)
- **Backend API:** [https://personal-library-wjbp.onrender.com/](https://personal-library-wjbp.onrender.com/)

---

## ✨ Features

- **📖 Book Management**: Add, edit, and delete books with details like Title, Author, and Genre.
- **🖼️ Image Uploads**: Upload and store book covers locally/on-server.
- **📊 Dynamic Dashboard**: Track total books, favorites, and reading progress at a glance.
- **🔍 Smart Search**: Real-time filtering by title or author.
- **⭐ Favorites & Progress**: Toggle "Favorite" status and "Read/Unread" status.
- **🤖 AI Librarian**: An integrated chatbot that knows your library and helps you with recommendations or queries.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Vanilla CSS.
- **Backend**: Python (FastAPI), Uvicorn.
- **AI Engine**: Groq Cloud API (Llama 3).
- **Database**: JSON/SQLite-based persistence.
- **Hosting**: GitHub Pages (Frontend) & Render (Backend).

---

## 🤖 AI Chatbot Integration Detail

The chatbot is the "smart" layer of this project. Here is how it's integrated:

### 1. Backend (FastAPI + Groq)
- **API Endpoint**: The backend exposes a `/chat` endpoint.
- **Context Awareness**: When you ask a question, the backend retrieves your current library data (titles, authors, status) and sends it to the **Groq Cloud API** as context.
- **Llama 3 Model**: We use the high-speed Llama 3 model via Groq to generate intelligent, context-aware responses about your specific books.

### 2. Frontend (React Widget)
- **ChatWidget Component**: A dedicated, floating UI component (`ChatWidget.jsx`) handles the user interface.
- **State Management**: It maintains the chat history and handling loading states while the AI "thinks".
- **Real-time Interaction**: Users can ask things like *"How many unread books do I have?"* or *"Recommend a book from my favorites."*

---

## 📦 Local Setup

### 1. Backend
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   py -m pip install -r requirements.txt
   ```
3. Create a `.env` file and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_key_here
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment Instructions

### Backend (Render)
1. Connect your GitHub repository to **Render.com**.
2. Set the **Build Command** to: `pip install -r requirements.txt`
3. Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port 10000`
4. Add your `GROQ_API_KEY` in the **Environment Variables** section.

### Frontend (GitHub Pages)
1. Install the deployment tool: `npm install gh-pages --save-dev`
2. Update `vite.config.js` with `base: '/personal_library/'`.
3. Run the deploy command:
   ```bash
   npm run deploy
   ```

---

## 👤 Author
**Harshanth**
- GitHub: [@harshanth0112](https://github.com/harshanth0112)
- Email: harshanth.ai22@krct.ac.in
