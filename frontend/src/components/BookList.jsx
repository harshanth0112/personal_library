import React from 'react';
import defaultCover from '../assets/book.webp';

const API = 'http://localhost:8000';

function BookCard({ book, onEdit, onDelete, onToggleFav, onToggleRead }) {
  const coverSrc = book.cover_image ? `${API}${book.cover_image}` : defaultCover;

  return (
    <div className={`book-card ${book.is_read ? 'is-read' : ''}`}>
      <div className="book-cover">
        <img src={coverSrc} alt={book.title} />
        <button
          className={`fav-btn ${book.is_favorite ? 'fav-active' : ''}`}
          onClick={() => onToggleFav(book.id)}
          title="Toggle favourite"
        >⭐</button>
      </div>

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>

        <div className="book-meta">
          {book.location && (
            <span className="meta-tag"> {book.location}</span>
          )}
          {book.published_date && (
            <span className="meta-tag">{book.published_date}</span>
          )}
          {book.isbn && (
            <span className="meta-tag">ISBN: {book.isbn}</span>
          )}
        </div>

        <div className="book-meta" style={{ marginTop: '4px' }}>
          <span className="meta-tag added">Added: {new Date(book.added_date).toLocaleDateString()}</span>
        </div>

        <div className="book-actions">
          <select
            className={`btn-read ${book.is_reading ? 'reading' : book.is_read ? 'read' : 'unread'}`}
            value={book.is_reading ? 'reading' : book.is_read ? 'read' : 'unread'}
            onChange={(e) => onToggleRead(book.id, e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            <option value="unread">Unread</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>
          <button className="btn-edit" onClick={() => onEdit(book)}> Edit</button>
          <button className="btn-delete" onClick={() => onDelete(book.id)}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

export default function BookList({ books, onEdit, onDelete, onToggleFav, onToggleRead }) {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p>No books found. Add your first book!</p>
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
