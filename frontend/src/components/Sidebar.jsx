import React from 'react';
import { Home, Wallet, TrendingUp, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ activePage, onPageChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id} className="sidebar-menu-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(item.id);
              }}
              className={`sidebar-menu-link ${activePage === item.id ? 'active' : ''}`}
            >
              <item.icon className="sidebar-menu-icon" />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div style={{ borderTop: '1px solid var(--border)', margin: '2rem 0' }}></div>

      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <a href="#" className="sidebar-menu-link" onClick={(e) => e.preventDefault()}>
            <LogOut className="sidebar-menu-icon" />
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}