import React from 'react';
import { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpenseTable({
  expenses,
  onExpenseDeleted,
  onEditExpense,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setDeletingId(id);
      try {
        const response = await expenseAPI.delete(id);
        if (response.data.success) {
          onExpenseDeleted();
        }
      } catch (error) {
        alert('Error deleting expense: ' + error.response?.data?.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getCategoryColor = (category) => {
    return `badge-${category.toLowerCase()}`;
  };

  const getPaymentColor = (method) => {
    const map = {
      'Cash': 'badge-cash',
      'Credit Card': 'badge-credit',
      'Debit Card': 'badge-debit',
      'Online Transfer': 'badge-transfer',
      'Other': 'badge-other'
    };
    return map[method] || 'badge-other';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'category':
        aVal = a.category;
        bVal = b.category;
        break;
      default:
        aVal = new Date(a.date);
        bVal = new Date(b.date);
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No Expenses Yet</div>
          <div className="empty-state-description">
            Start tracking your expenses by adding your first transaction.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Description</th>
            <th>Category</th>
            <th
              onClick={() => {
                if (sortBy === 'amount') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('amount');
                  setSortOrder('desc');
                }
              }}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Payment Method</th>
            <th
              onClick={() => {
                if (sortBy === 'date') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <React.Fragment key={expense._id}>
              <tr>
                <td
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                  onClick={() =>
                    setExpandedRow(expandedRow === expense._id ? null : expense._id)
                  }
                >
                  {expense.notes && (expandedRow === expense._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </td>
                <td>
                  <strong>{expense.description}</strong>
                </td>
                <td>
                  <span className={`category-badge ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td>
                  <strong style={{ color: 'var(--danger)' }}>
                    ${expense.amount.toFixed(2)}
                  </strong>
                </td>
                <td>
                  <span className={`badge ${getPaymentColor(expense.paymentMethod)}`}>
                    {expense.paymentMethod}
                  </span>
                </td>
                <td>{formatDate(expense.date)}</td>
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditExpense(expense)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(expense._id)}
                      disabled={deletingId === expense._id}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRow === expense._id && expense.notes && (
                <tr>
                  <td colSpan="7" style={{ background: '#f8fafc', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <div style={{ paddingLeft: '2rem' }}>
                      <strong>Notes:</strong> {expense.notes}
                      <br />
                      <small style={{ color: 'var(--text-light)' }}>
                        Added: {formatDate(expense.createdAt)} {formatTime(expense.createdAt)}
                      </small>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}