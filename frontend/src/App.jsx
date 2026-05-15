import React, { useState } from 'react';
import './styles/index.css';
import { expenseAPI } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [currency, setCurrency] = useState('Rs.'); // Currency state

  React.useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const response = await expenseAPI.getStatistics({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));

    // No limit on amount - can enter any big number
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await expenseAPI.create({
        description: formData.get('description'),
        amount: amount,
        category: formData.get('category'),
        paymentMethod: formData.get('paymentMethod'),
        date: formData.get('date'),
        notes: formData.get('notes'),
      });
      e.target.reset();
      e.target.querySelector('input[name="date"]').valueAsDate = new Date();
      fetchExpenses();
      fetchStats();
      alert('Expense added successfully!');
    } catch (err) {
      alert('Error adding expense: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        fetchExpenses();
        fetchStats();
        alert('Expense deleted!');
      } catch (err) {
        alert('Error deleting expense');
      }
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Currency symbol formatter
  const formatAmount = (amount) => {
    if (currency === 'Rs.') {
      return `Rs. ${amount.toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
    } else if (currency === '$') {
      return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    } else if (currency === '€') {
      return `€${amount.toLocaleString('en-EU', { maximumFractionDigits: 2 })}`;
    }
    return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="app-container">
      {sidebarOpen && (
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li className="sidebar-menu-item">
              <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }} className={`sidebar-menu-link ${activePage === 'dashboard' ? 'active' : ''}`}>
                <span>📊 Dashboard</span>
              </a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('expenses'); }} className={`sidebar-menu-link ${activePage === 'expenses' ? 'active' : ''}`}>
                <span>💸 Expenses</span>
              </a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('reports'); }} className={`sidebar-menu-link ${activePage === 'reports' ? 'active' : ''}`}>
                <span>📈 Reports</span>
              </a>
            </li>
          </ul>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2rem 0' }}></div>

          <div style={{ padding: '0 1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
              💱 Currency
            </label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                color: 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              <option value="Rs.">🇱🇰 Sri Lankan Rs.</option>
              <option value="$">🇺🇸 US Dollar ($)</option>
              <option value="€">🇪🇺 Euro (€)</option>
              <option value="₹">🇮🇳 Indian Rupee (₹)</option>
              <option value="£">🇬🇧 British Pound (£)</option>
            </select>
          </div>
        </aside>
      )}
      
      <div className="main-content">
        <nav className="navbar">
          <div className="navbar-title">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
              ☰
            </button>
            <span>💰 Expense Tracker</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            💱 {currency}
          </div>
        </nav>
        
        <div className="content">
          {activePage === 'dashboard' && (
            <div>
              <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p className="subtitle">Welcome! Here's your expense overview.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card success">
                  <div className="stat-label">Total This Month</div>
                  <div className="stat-value">{formatAmount(stats?.totalExpense || 0)}</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-label">Transactions</div>
                  <div className="stat-value">{stats?.transactionCount || 0}</div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-label">Average</div>
                  <div className="stat-value">{formatAmount(stats?.averageExpense || 0)}</div>
                </div>
              </div>

              <div className="card">
                <h2>➕ Add New Expense</h2>
                <form onSubmit={handleAddExpense}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Description *</label>
                      <input type="text" name="description" className="form-control" placeholder="What did you buy?" maxLength="100" required />
                    </div>
                    <div className="form-group">
                      <label>Amount ({currency}) *</label>
                      <input 
                        type="number" 
                        name="amount" 
                        className="form-control" 
                        placeholder="Enter amount (no limit)" 
                        step="0.01"
                        min="0"
                        required 
                      />
                      <small style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>You can enter any amount</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select name="category" className="form-control" required>
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Entertainment</option>
                        <option>Shopping</option>
                        <option>Bills</option>
                        <option>Healthcare</option>
                        <option>Education</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select name="paymentMethod" className="form-control">
                        <option>Cash</option>
                        <option>Credit Card</option>
                        <option>Debit Card</option>
                        <option>Online Transfer</option>
                        <option>Mobile Payment</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" name="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <input type="text" name="notes" className="form-control" placeholder="Optional notes" maxLength="200" />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">➕ Add Expense</button>
                </form>
              </div>

              <div className="card">
                <h2>📋 Recent Expenses</h2>
                {expenses.length === 0 ? (
                  <p style={{ color: 'var(--text-light)' }}>No expenses yet. Add your first expense above!</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.slice(0, 5).map((exp) => (
                          <tr key={exp._id}>
                            <td>{exp.description}</td>
                            <td><span className={`category-badge badge-${exp.category.toLowerCase()}`}>{exp.category}</span></td>
                            <td><strong>{formatAmount(exp.amount)}</strong></td>
                            <td>{new Date(exp.date).toLocaleDateString('en-LK')}</td>
                            <td>
                              <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-danger btn-sm">🗑️ Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === 'expenses' && (
            <div>
              <div className="page-header">
                <h1>💸 All Expenses</h1>
                <p className="subtitle">View and manage all your expenses.</p>
              </div>

              <div className="card">
                <h2>📋 All Expenses ({expenses.length})</h2>
                <p style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Total: <span style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>{formatAmount(totalExpense)}</span>
                </p>

                {expenses.length === 0 ? (
                  <p style={{ color: 'var(--text-light)' }}>No expenses yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((exp) => (
                          <tr key={exp._id}>
                            <td>
                              <strong>{exp.description}</strong>
                              {exp.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>📝 {exp.notes}</div>}
                            </td>
                            <td><span className={`category-badge badge-${exp.category.toLowerCase()}`}>{exp.category}</span></td>
                            <td><strong style={{ color: 'var(--danger)' }}>{formatAmount(exp.amount)}</strong></td>
                            <td><span className={`badge badge-${exp.paymentMethod.toLowerCase().replace(' ', '')}`}>{exp.paymentMethod}</span></td>
                            <td>{new Date(exp.date).toLocaleDateString('en-LK')}</td>
                            <td>
                              <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-danger btn-sm">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === 'reports' && (
            <div>
              <div className="page-header">
                <h1>📈 Reports & Analytics</h1>
                <p className="subtitle">Visualize your spending patterns.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">💰 Total Expenses</div>
                  <div className="stat-value">{formatAmount(stats?.totalExpense || 0)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">📊 Total Transactions</div>
                  <div className="stat-value">{stats?.transactionCount || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">📈 Categories</div>
                  <div className="stat-value">{Object.keys(stats?.categoryWise || {}).length}</div>
                </div>
              </div>

              <div className="card">
                <h2>📊 Spending by Category</h2>
                {stats?.categoryWise && Object.keys(stats.categoryWise).length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.categoryWise)
                          .sort((a, b) => b[1] - a[1])
                          .map(([category, amount]) => {
                            const percentage = ((amount / stats.totalExpense) * 100).toFixed(1);
                            return (
                              <tr key={category}>
                                <td><strong>{category}</strong></td>
                                <td>{formatAmount(amount)}</td>
                                <td>{percentage}%</td>
                                <td>
                                  <div style={{
                                    backgroundColor: 'var(--border)',
                                    height: '20px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    width: '100px'
                                  }}>
                                    <div style={{
                                      backgroundColor: 'var(--primary)',
                                      height: '100%',
                                      width: `${percentage}%`,
                                      transition: 'width 0.3s'
                                    }}></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-light)' }}>No data available.</p>
                )}
              </div>

              <div className="card">
                <h2>💳 Spending by Payment Method</h2>
                {stats?.paymentWise && Object.keys(stats.paymentWise).length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.paymentWise)
                          .sort((a, b) => b[1] - a[1])
                          .map(([method, amount]) => (
                            <tr key={method}>
                              <td>{method}</td>
                              <td>{formatAmount(amount)}</td>
                              <td>{((amount / stats.totalExpense) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-light)' }}>No data available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}