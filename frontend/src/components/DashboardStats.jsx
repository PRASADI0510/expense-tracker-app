import React, { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import { TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const response = await expenseAPI.getStatistics({
        month: currentMonth,
        year: currentYear,
      });

      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="stats-grid">
      <div className="stat-card success">
        <div className="stat-label">
          <DollarSign size={16} />
          Total Expenses (This Month)
        </div>
        <div className="stat-value">${stats?.totalExpense?.toFixed(2) || '0.00'}</div>
        <div className="stat-change">
          {stats?.transactionCount || 0} transactions
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-label">
          <Calendar size={16} />
          Average per Transaction
        </div>
        <div className="stat-value">${stats?.averageExpense?.toFixed(2) || '0.00'}</div>
        <div className="stat-change">
          {stats?.transactionCount || 0} total
        </div>
      </div>

      <div className="stat-card danger">
        <div className="stat-label">
          <TrendingUp size={16} />
          Highest Category
        </div>
        <div className="stat-value">
          {stats?.categoryWise
            ? Object.keys(stats.categoryWise).reduce((a, b) =>
                stats.categoryWise[a] > stats.categoryWise[b] ? a : b,
                'N/A'
              )
            : 'N/A'}
        </div>
        <div className="stat-change">
          ${Object.values(stats?.categoryWise || {})[0]?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <Activity size={16} />
          Active Categories
        </div>
        <div className="stat-value">{Object.keys(stats?.categoryWise || {}).length}</div>
        <div className="stat-change">This month</div>
      </div>
    </div>
  );
}