import React from 'react';

export default function Dashboard({ stats, activeFilter, setActiveFilter }) {
  const cards = [
    { label: 'Total Books', value: stats.total, filter: 'all', color: '#4f46e5', icon: '📚' },
    { label: 'Favourites', value: stats.favorites, filter: 'favorites', color: '#f59e0b', icon: '⭐' },
    { label: 'Reading', value: stats.reading || 0, filter: 'reading', color: '#3b82f6', icon: '📖' },
    { label: 'Read', value: stats.read, filter: 'read', color: '#10b981', icon: '✅' },
    { label: 'Unread', value: stats.unread, filter: 'unread', color: '#6366f1', icon: '📫' },
  ];

  return (
    <div className="dashboard">
      {cards.map(c => (
        <div
          key={c.filter}
          className={`stat-card ${activeFilter === c.filter ? 'active' : ''}`}
          onClick={() => setActiveFilter(c.filter)}
          style={{ '--accent': c.color }}
        >
          <span className="stat-icon">{c.icon}</span>
          <div className="stat-info">
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
