import React from 'react';

const API = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000' 
  : 'https://n3qo23o5ad2j7asjzqzncw6fee0itqaj.lambda-url.ap-south-1.on.aws';

function BookCard({ book, onEdit, onDelete, onToggleFav, onToggleRead }) {
  // If the cover_image is a full URL (S3), use it directly.
  // If it starts with /uploads, prefix it with the API URL.
  const coverSrc = book.cover_image 
    ? (book.cover_image.startsWith('http') ? book.cover_image : `${API}${book.cover_image}`) 
    : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'; // Premium placeholder

  return (
    <div className={`book-card fade-in ${book.is_read ? 'is-read' : ''}`}>
      <div className="book-cover">
        <img src={coverSrc} alt={book.title} loading="lazy" />
        <button
          className={`fav-btn ${book.is_favorite ? 'fav-active' : ''}`}
          onClick={() => onToggleFav(book.id)}
          title="Toggle favourite"
        >
          {book.is_favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="book-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className="book-title">{book.title}</h3>
        </div>
        <p className="book-author">by {book.author}</p>

        <div className="book-meta">
          {book.location && (
            <span className="meta-tag">📍 {book.location}</span>
          )}
          {book.published_date && (
            <span className="meta-tag">📅 {book.published_date}</span>
          )}
          {book.isbn && (
            <span className="meta-tag">ID: {book.isbn}</span>
          )}
        </div>

        <div className="book-meta">
          <span className="meta-tag added">Added {new Date(book.added_date).toLocaleDateString()}</span>
        </div>

        <div className="book-actions">
          <select
            className={`btn-read ${book.is_reading ? 'reading' : book.is_read ? 'read' : 'unread'}`}
            value={book.is_reading ? 'reading' : book.is_read ? 'read' : 'unread'}
            onChange={(e) => onToggleRead(book.id, e.target.value)}
          >
            <option value="unread">Unread</option>
            <option value="reading">📖 Reading</option>
            <option value="read">✅ Read</option>
          </select>
          <button className="btn-edit" onClick={() => onEdit(book)} title="Edit">
            ✏️
          </button>
          <button className="btn-delete" onClick={() => onDelete(book.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookList({ books, onEdit, onDelete, onToggleFav, onToggleRead }) {
  if (books.length === 0) {
    return (
      <div className="empty-state fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Your library is empty</h3>
        <p style={{ color: 'var(--text-muted)' }}>Start by adding some books to your collection.</p>
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map(b => (
        <BookCard
          key={b.id}
          book={b}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFav={onToggleFav}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  );
}
