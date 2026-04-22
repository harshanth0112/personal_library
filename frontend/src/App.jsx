import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import SearchBar from './components/SearchBar';
import ChatWidget from './components/ChatWidget';
import './App.css';

const API = 'https://personal-library-wjbp.onrender.com';

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, read: 0, unread: 0, reading: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBooks = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const url = q ? `${API}/books/?search=${encodeURIComponent(q)}` : `${API}/books/`;
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats/`);
      setStats(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchBooks(); fetchStats(); }, [fetchBooks, fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchBooks]);

  const handleSave = async (formData, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/books/${id}` : `${API}/books/`;
    await fetch(url, { method, body: formData });
    setShowForm(false);
    setEditBook(null);
    fetchBooks(search);
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this book from your library?')) return;
    await fetch(`${API}/books/${id}`, { method: 'DELETE' });
    fetchBooks(search);
    fetchStats();
  };

  const handleToggle = async (id, type) => {
    await fetch(`${API}/books/${id}/${type}`, { method: 'PATCH' });
    fetchBooks(search);
    fetchStats();
  };

  const handleStatusChange = async (id, status) => {
    await fetch(`${API}/books/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchBooks(search);
    fetchStats();
  };

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
            <p className="app-subtitle">Your personal reading space</p>
          </div>
        </div>
        <button className="btn-add" onClick={() => { setEditBook(null); setShowForm(true); }}>
          + Add Book
        </button>
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

      <ChatWidget />
    </div>
  );
}
