import express from 'express';
import {
  getExpenses,
  getExpenseById,
  getStatistics,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';

const router = express.Router();

// Middleware to set userId (demo user)
router.use((req, res, next) => {
  req.userId = 'demo-user-123';
  console.log('✅ User ID set to:', req.userId);
  next();
});

// Routes
router.get('/', getExpenses);
router.get('/statistics', getStatistics);
router.get('/:id', getExpenseById);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;