import React, { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#8b5cf6',
  '#14b8a6',
];

export default function Reports() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getStatistics({
        month: selectedMonth,
        year: selectedYear,
      });
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryChartData = statistics
    ? Object.entries(statistics.categoryWise).map(([category, amount]) => ({
        name: category,
        value: parseFloat(amount.toFixed(2)),
      }))
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>📈 Reports & Analytics</h1>
        <p className="subtitle">Visualize your spending patterns and trends.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Select Period</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card success">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value">
                ${statistics?.totalExpense?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{statistics?.transactionCount || 0}</div>
            </div>

            <div className="stat-card danger">
              <div className="stat-label">Average per Transaction</div>
              <div className="stat-value">
                $
                {statistics?.transactionCount
                  ? (statistics.totalExpense / statistics.transactionCount).toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>📊 Spending by Category</h3>

            {categoryChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Category Breakdown</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryChartData
                          .sort((a, b) => b.value - a.value)
                          .map((item) => (
                            <tr key={item.name}>
                              <td>{item.name}</td>
                              <td>${item.value.toFixed(2)}</td>
                              <td>
                                {(
                                  (item.value / statistics.totalExpense) *
                                  100
                                ).toFixed(1)}
                                %
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No expense data available for this period.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}