import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrap">
      
      <input
        className="search-input"
        type="text"
        placeholder="Search by title or author..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  );
}
