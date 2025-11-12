import asyncHandler from 'express-async-handler';
import Transaction from '../../models/Transaction.js';
import Order from '../../models/Order.js';
import { parseDateRange } from '../../middleware/queryFilter.js';

// @desc    Get all transactions with filtering
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = asyncHandler(async (req, res) => {
  res.json(res.advancedResults);
});

// @desc    Get transaction by ID
// @route   GET /api/admin/transactions/:id
// @access  Private/Admin
export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('order')
    .populate('user', 'name email phone');

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.json({
    success: true,
    data: transaction,
  });
});

// @desc    Refund transaction
// @route   POST /api/admin/transactions/:id/refund
// @access  Private/Admin
export const refundTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'Completed') {
    res.status(400);
    throw new Error('Only completed transactions can be refunded');
  }

  if (transaction.status === 'Refunded') {
    res.status(400);
    throw new Error('Transaction already refunded');
  }

  // Update transaction status
  transaction.status = 'Refunded';
  transaction.refundedAt = new Date();
  transaction.refundedBy = req.user._id;
  await transaction.save();

  // Update order status
  await Order.findByIdAndUpdate(transaction.order, {
    paymentStatus: 'Refunded',
    status: 'Cancelled',
  });

  // TODO: Implement actual Bkash refund API call here
  // const bkashRefund = await processBkashRefund(transaction);

  res.json({
    success: true,
    message: 'Transaction refunded successfully',
    data: transaction,
  });
});

// @desc    Get transaction statistics
// @route   GET /api/admin/transactions/stats
// @access  Private/Admin
export const getTransactionStats = asyncHandler(async (req, res) => {
  const { range = '7days' } = req.query;
  const dateFilter = parseDateRange(range);

  const stats = await Transaction.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const methodStats = await Transaction.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);

  const dailyTransactions = await Transaction.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
        revenue: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Total revenue
  const totalRevenue = await Transaction.aggregate([
    {
      $match: {
        status: 'Completed',
        createdAt: dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Failed transaction rate
  const totalTransactions = await Transaction.countDocuments({
    createdAt: dateFilter,
  });
  const failedTransactions = await Transaction.countDocuments({
    status: 'Failed',
    createdAt: dateFilter,
  });

  res.json({
    success: true,
    data: {
      statusBreakdown: stats,
      methodBreakdown: methodStats,
      dailyTransactions,
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions,
        failedTransactions,
        failureRate: totalTransactions > 0 
          ? ((failedTransactions / totalTransactions) * 100).toFixed(2)
          : 0,
      },
    },
  });
});

// @desc    Export transactions to CSV
// @route   GET /api/admin/transactions/export/csv
// @access  Private/Admin
export const exportTransactionsCSV = asyncHandler(async (req, res) => {
  const { exportTransactionsToCSV } = await import('../../utils/exportCSV.js');

  const transactions = await Transaction.find()
    .populate('order', '_id')
    .populate('user', 'name email')
    .sort('-createdAt');

  const filepath = await exportTransactionsToCSV(transactions);

  res.download(filepath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    setTimeout(() => {
      fs.unlinkSync(filepath);
    }, 1000);
  });
});

// @desc    Reconcile transactions (match with Bkash)
// @route   POST /api/admin/transactions/reconcile
// @access  Private/Admin
export const reconcileTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  // Get pending transactions
  const pendingTransactions = await Transaction.find({
    status: 'Pending',
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const reconciled = [];
  const failed = [];

  // TODO: Implement Bkash transaction verification
  for (const txn of pendingTransactions) {
    try {
      // const bkashStatus = await queryBkashTransaction(txn.transactionId);
      // Update transaction based on Bkash response
      
      // Placeholder:
      reconciled.push(txn._id);
    } catch (error) {
      failed.push({ id: txn._id, error: error.message });
    }
  }

  res.json({
    success: true,
    message: 'Transaction reconciliation completed',
    data: {
      total: pendingTransactions.length,
      reconciled: reconciled.length,
      failed: failed.length,
      details: { reconciled, failed },
    },
  });
});