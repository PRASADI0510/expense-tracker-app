import React from 'react';
import { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import { Plus, X } from 'lucide-react';

export default function ExpenseForm({ onExpenseAdded, editingExpense = null, onCancel = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(
    editingExpense || {
      description: '',
      amount: '',
      category: 'Food',
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  );

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Other',
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Online Transfer',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.description.trim() || !form.amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (editingExpense?._id) {
        await expenseAPI.update(editingExpense._id, expenseData);
      } else {
        await expenseAPI.create(expenseData);
      }

      setForm({
        description: '',
        amount: '',
        category: 'Food',
        paymentMethod: 'Cash',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      onExpenseAdded();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving expense');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>{editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="btn btn-secondary btn-sm">
            <X size={18} /> Cancel
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              name="description"
              className="form-control"
              placeholder="What did you spend on?"
              value={form.description}
              onChange={handleChange}
              required
              maxLength="100"
            />
            <div className="form-help">{form.description.length}/100</div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ($) *</label>
            <input
              id="amount"
              type="number"
              name="amount"
              className="form-control"
              placeholder="0.00"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={form.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="form-control"
              value={form.paymentMethod}
              onChange={handleChange}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              type="text"
              name="notes"
              className="form-control"
              placeholder="Additional notes (optional)"
              value={form.notes}
              onChange={handleChange}
              maxLength="200"
            />
            <div className="form-help">{form.notes.length}/200</div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Plus size={18} />
          {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}