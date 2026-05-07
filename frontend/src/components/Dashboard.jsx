import React from 'react';

export default function Dashboard({ stats, activeFilter, setActiveFilter }) {
  const cards = [
    { label: 'Total Books', value: stats.total, filter: 'all', icon: '📚' },
    { label: 'Favourites', value: stats.favorites, filter: 'favorites', icon: '✨' },
    { label: 'Reading Now', value: stats.reading || 0, filter: 'reading', icon: '📖' },
    { label: 'Completed', value: stats.read, filter: 'read', icon: '🎯' },
    { label: 'Wishlist', value: stats.unread, filter: 'unread', icon: '⏳' },
  ];

  return (
    <div className="dashboard fade-in">
      {cards.map(c => (
        <div
          key={c.filter}
          className={`stat-card ${activeFilter === c.filter ? 'active' : ''}`}
          onClick={() => setActiveFilter(c.filter)}
        >
          <div className="stat-icon">{c.icon}</div>
          <div className="stat-info">
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
