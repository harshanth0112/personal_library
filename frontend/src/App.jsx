import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import SearchBar from './components/SearchBar';
import ChatWidget from './components/ChatWidget';
import Login from './components/Login';
import './App.css';

const API = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000' 
  : 'https://n3qo23o5ad2j7asjzqzncw6fee0itqaj.lambda-url.ap-south-1.on.aws';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('library_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('library_user')) || null);
  
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, read: 0, unread: 0, reading: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('library_token', newToken);
    localStorage.setItem('library_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
  };

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  const fetchBooks = useCallback(async (q = '') => {
    if (!token) return;
    setLoading(true);
    try {
      const url = q ? `${API}/books/?search=${encodeURIComponent(q)}` : `${API}/books/`;
      const res = await fetch(url, { headers: authHeaders });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        console.error("API returned an error:", data);
        setBooks([]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/stats/`, { headers: authHeaders });
      if (res.status === 401) return;
      setStats(await res.json());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { 
    if (token) {
      fetchBooks(); 
      fetchStats(); 
    }
  }, [token, fetchBooks, fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchBooks]);

  const handleSave = async (formData, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/books/${id}` : `${API}/books/`;
    await fetch(url, { 
      method, 
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` } // formData doesn't need Content-Type header
    });
    setShowForm(false);
    setEditBook(null);
    fetchBooks(search);
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this book from your library?')) return;
    await fetch(`${API}/books/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchBooks(search);
    fetchStats();
  };

  const handleToggle = async (id, type) => {
    await fetch(`${API}/books/${id}/${type}`, { method: 'PATCH', headers: authHeaders });
    fetchBooks(search);
    fetchStats();
  };

  const handleStatusChange = async (id, status) => {
    await fetch(`${API}/books/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ status })
    });
    fetchBooks(search);
    fetchStats();
  };

  const urlParams = new URLSearchParams(window.location.search);
  const resetTokenParam = urlParams.get('reset_token');

  if (!token) {
    return <Login onLogin={handleLogin} API={API} initialResetToken={resetTokenParam} />;
  }

  const filteredBooks = books.filter(b => {
    if (activeFilter === 'favorites') return b.is_favorite;
    if (activeFilter === 'read') return b.is_read;
    if (activeFilter === 'unread') return !b.is_read;
    if (activeFilter === 'reading') return b.is_reading;
    return true;
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div>
            <h1 className="app-title">My Library</h1>
            <p className="app-subtitle">Welcome, {user?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-add" onClick={() => { setEditBook(null); setShowForm(true); }}>
            + Add Book
          </button>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <Dashboard stats={stats} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        <div className="list-section">
          <SearchBar value={search} onChange={setSearch} />
          {loading ? (
            <div className="loading">Loading your books...</div>
          ) : (
            <BookList
              books={filteredBooks}
              onEdit={(b) => { setEditBook(b); setShowForm(true); }}
              onDelete={handleDelete}
              onToggleFav={(id) => handleToggle(id, 'favorite')}
              onToggleRead={(id, status) => handleStatusChange(id, status)}
            />
          )}
        </div>
      </main>

      {showForm && (
        <BookForm
          book={editBook}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditBook(null); }}
        />
      )}

      <ChatWidget token={token} />
    </div>
  );
}

