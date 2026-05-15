import React from 'react';

export default function Navbar({ onMenuToggle, userName = 'User' }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.5rem',
          }}
        >
          ☰
        </button>
        <span>💰 Expense Tracker</span>
      </div>
      <div className="navbar-actions">
        <button className="btn btn-secondary btn-sm">🔔</button>
        <button className="btn btn-secondary btn-sm">👤 {userName}</button>
        <button className="btn btn-secondary btn-sm">🚪</button>
      </div>
    </nav>
  );
}