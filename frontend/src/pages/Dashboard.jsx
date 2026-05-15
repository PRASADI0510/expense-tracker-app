import React, { useEffect, useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import { expenseAPI } from '../services/api';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p className="subtitle">Welcome back! Here's your expense overview.</p>
      </div>

      <DashboardStats />

      <div style={{ marginBottom: '2rem' }}>
        <ExpenseForm onExpenseAdded={fetchExpenses} />
      </div>

      <div className="card">
        <h2>📋 Recent Expenses</h2>
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses.slice(0, 10)}
            onExpenseDeleted={fetchExpenses}
            onEditExpense={() => {}}
          />
        )}
      </div>
    </div>
  );
}