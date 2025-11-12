import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Food from '../../models/Food.js';
import Transaction from '../../models/Transaction.js';
import { parseDateRange } from '../../middleware/queryFilter.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { range = '7days' } = req.query;
  const dateFilter = parseDateRange(range);

  // Total stats
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  // Period stats
  const periodOrders = await Order.countDocuments({
    createdAt: dateFilter,
  });

  const periodRevenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Completed',
        createdAt: dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  // Pending orders
  const pendingOrders = await Order.countDocuments({
    status: { $in: ['Pending', 'Preparing'] },
  });

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today },
  });

  const todayRevenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Completed',
        createdAt: { $gte: today },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .populate('items.food', 'name price')
    .sort('-createdAt')
    .limit(10);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },
    { $unwind: '$foodDetails' },
    {
      $project: {
        name: '$foodDetails.name',
        image: '$foodDetails.image',
        quantity: '$totalQuantity',
        revenue: '$totalRevenue',
      },
    },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      periodOrders,
      periodRevenue: periodRevenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      averageOrderValue:
        periodOrders > 0 ? (periodRevenue[0]?.total || 0) / periodOrders : 0,
    },
    recentOrders,
    topProducts,
  });
});

// @desc    Get sales data for charts
// @route   GET /api/admin/sales-data
// @access  Private/Admin
export const getSalesData = asyncHandler(async (req, res) => {
  const { range = '7days' } = req.query;
  const dateFilter = parseDateRange(range);

  // Daily sales
  const dailySales = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Completed',
        createdAt: dateFilter,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Category sales
  const categorySales = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'foods',
        localField: 'items.food',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },
    { $unwind: '$foodDetails' },
    {
      $group: {
        _id: '$foodDetails.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  // Hourly order pattern
  const hourlyPattern = await Order.aggregate([
    {
      $match: {
        createdAt: dateFilter,
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    dailySales,
    categorySales,
    hourlyPattern,
  });
});

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  // Get recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(parseInt(limit));

  // Get recent users
  const recentUsers = await User.find({ role: 'user' })
    .sort('-createdAt')
    .limit(5);

  // Get recent transactions
  const recentTransactions = await Transaction.find()
    .populate('order', 'orderNumber')
    .sort('-createdAt')
    .limit(5);

  // Format notifications
  const notifications = [];

  // Add order notifications
  recentOrders.forEach((order) => {
    const timeAgo = getTimeAgo(order.createdAt);
    notifications.push({
      id: `order-${order._id}`,
      type: 'order',
      title: 'New Order',
      message: `New order #${order.orderNumber} from ${order.user?.name || 'Customer'}`,
      amount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      timeAgo,
      unread: order.status === 'Pending' || order.paymentStatus === 'Pending',
      link: `/admin/orders/${order._id}`,
    });
  });

  // Add user notifications
  recentUsers.forEach((user) => {
    const timeAgo = getTimeAgo(user.createdAt);
    notifications.push({
      id: `user-${user._id}`,
      type: 'user',
      title: 'New User',
      message: `${user.name} joined Food Lab`,
      createdAt: user.createdAt,
      timeAgo,
      unread: true,
      link: `/admin/users/${user._id}`,
    });
  });

  // Add payment notifications
  recentTransactions.forEach((transaction) => {
    if (transaction.status === 'Completed') {
      const timeAgo = getTimeAgo(transaction.createdAt);
      notifications.push({
        id: `payment-${transaction._id}`,
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of ৳${transaction.amount} received for order #${transaction.order?.orderNumber || 'N/A'}`,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        timeAgo,
        unread: true,
        link: `/admin/transactions/${transaction._id}`,
      });
    }
  });

  // Sort by createdAt (most recent first)
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Limit to requested number
  const limitedNotifications = notifications.slice(0, parseInt(limit));

  const unreadCount = limitedNotifications.filter((n) => n.unread).length;

  res.json({
    success: true,
    notifications: limitedNotifications,
    unreadCount,
  });
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}