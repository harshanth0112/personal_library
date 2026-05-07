import React, { useState, useEffect, useRef } from 'react';

const API = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000' 
  : 'https://n3qo23o5ad2j7asjzqzncw6fee0itqaj.lambda-url.ap-south-1.on.aws';

export default function BookForm({ book, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', author: '', published_date: '', location: '', isbn: '',
    is_favorite: false, is_read: false,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        published_date: book.published_date || '',
        location: book.location || '',
        isbn: book.isbn || '',
        is_favorite: book.is_favorite || false,
        is_read: book.is_read || false,
      });
      if (book.cover_image) {
        setPreview(book.cover_image.startsWith('http') ? book.cover_image : `${API}${book.cover_image}`);
      }
    }
  }, [book]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) fd.append('cover_image', coverFile);
    await onSave(fd, book?.id);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="cover-upload" onClick={() => fileRef.current.click()} style={{ background: '#f8fafc', position: 'relative' }}>
            {preview ? (
              <img src={preview} alt="Cover preview" className="cover-preview" />
            ) : (
              <div className="cover-placeholder-upload">
                <span style={{ fontSize: '2rem' }}>🖼️</span>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Upload Cover Image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Book Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="The Great Gatsby" required />
            </div>

            <div className="form-group">
              <label>Author *</label>
              <input name="author" value={form.author} onChange={handleChange}
                placeholder="F. Scott Fitzgerald" required />
            </div>

            <div className="form-group">
              <label>Published Date</label>
              <input name="published_date" type="date" value={form.published_date}
                onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Location / Shelf</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Living Room Shelf" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange}
                placeholder="e.g. 978-3-16-148410-0" />
            </div>
          </div>

          <div className="checkbox-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_favorite" checked={form.is_favorite}
                onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Add to Favorites</span>
            </label>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_read" checked={form.is_read}
                onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Finished Reading</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : book ? 'Save Changes' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
