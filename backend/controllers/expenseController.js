import Expense from '../models/Expense.js';

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const userId = req.userId;

    let filter = { userId };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get statistics
export const getStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.userId;

    let filter = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(filter).lean();

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryWise = {};
    const paymentWise = {};

    expenses.forEach((exp) => {
      categoryWise[exp.category] = (categoryWise[exp.category] || 0) + exp.amount;
      paymentWise[exp.paymentMethod] = (paymentWise[exp.paymentMethod] || 0) + exp.amount;
    });

    const dailyTotals = {};
    expenses.forEach((exp) => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0];
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + exp.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        categoryWise: Object.keys(categoryWise).reduce((acc, key) => {
          acc[key] = parseFloat(categoryWise[key].toFixed(2));
          return acc;
        }, {}),
        paymentWise: Object.keys(paymentWise).reduce((acc, key) => {
          acc[key] = parseFloat(paymentWise[key].toFixed(2));
          return acc;
        }, {}),
        transactionCount: expenses.length,
        dailyTotals,
        averageExpense: expenses.length > 0 ? parseFloat((totalExpense / expenses.length).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create expense 
export const createExpense = async (req, res) => {
  try {
    console.log('📝 Received expense data:', req.body);

    const { description, amount, category, paymentMethod, date, notes } = req.body;

    // Validation
    if (!description || amount === undefined || !category) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide description, amount, and category',
      });
    }

    if (isNaN(amount) || amount <= 0) {
      console.log('❌ Invalid amount');
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number greater than 0',
      });
    }

    // Use demo user ID
    const userId = 'demo-user-123';

    const newExpense = new Expense({
      userId,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      paymentMethod: paymentMethod || 'Cash',
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    console.log('💾 Saving expense:', newExpense);
    const savedExpense = await newExpense.save();
    console.log('✅ Expense saved successfully:', savedExpense._id);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: savedExpense,
    });
  } catch (error) {
    console.error('❌ Error creating expense:', error.message);
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating expense',
    });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, paymentMethod, date, notes } = req.body;
    const userId = req.userId;

    let expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    if (description) expense.description = description;
    if (amount) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};