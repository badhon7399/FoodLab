import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { advancedFilter } from '../middleware/queryFilter.js';
import { uploadSingleFoodImage, uploadMultipleFoodImages } from '../middleware/upload.js';

// Import models
import Order from '../models/Order.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';

// Import controllers
import {
  getDashboardStats,
  getSalesData,
  getNotifications,
} from '../controllers/admin/dashboardController.js';

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  deleteOrder,
  bulkDeleteOrders,
  exportOrdersCSV,
  exportOrdersPDF,
} from '../controllers/admin/orderController.js';

import {
  getAllFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  bulkDeleteFoodItems,
  bulkUpdateAvailability,
  uploadFoodImage,
} from '../controllers/admin/foodController.js';

import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  bulkUpdateUsersStatus,
  exportUsersCSV,
} from '../controllers/admin/userController.js';

import {
  getAnalytics,
  exportSalesReport,
  getRealtimeStats,
} from '../controllers/admin/analyticsController.js';

import {
  getAllTransactions,
  getTransactionById,
  refundTransaction,
  getTransactionStats,
  exportTransactionsCSV,
  reconcileTransactions,
} from '../controllers/admin/transactionController.js';

import {
  getAllReviews,
  approveReview,
  deleteReview,
  replyToReview,
  bulkApproveReviews,
  bulkDeleteReviews,
  getReviewStats,
} from '../controllers/admin/reviewController.js';

import {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
  getPromoCodeStats,
  validatePromoCode,
} from '../controllers/admin/promoCodeController.js';

import {
  getSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateOrderSettings,
  updateNotificationSettings,
  updateAdminProfile,
  changePassword,
} from '../controllers/admin/settingsController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(admin);

// ========== Dashboard Routes ==========
router.get('/stats', getDashboardStats);
router.get('/sales-data', getSalesData);
router.get('/notifications', getNotifications);

// ========== Order Routes ==========
router.get('/orders', advancedFilter(Order, 'user items.food'), getAllOrders);
router.get('/orders/export/csv', exportOrdersCSV);
router.get('/orders/export/pdf', exportOrdersPDF);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/bulk/status', bulkUpdateOrderStatus);
router.delete('/orders/:id', deleteOrder);
router.delete('/orders/bulk', bulkDeleteOrders);

// ========== Food/Menu Routes ==========
router.get('/food', advancedFilter(Food), getAllFoodItems);
router.post('/food', uploadMultipleFoodImages, createFoodItem);
router.post('/food/upload', uploadSingleFoodImage, uploadFoodImage);
router.put('/food/:id', uploadMultipleFoodImages, updateFoodItem);
router.put('/food/bulk/availability', bulkUpdateAvailability);
router.delete('/food/:id', deleteFoodItem);
router.delete('/food/bulk', bulkDeleteFoodItems);

// ========== User Routes ==========
router.get('/users', advancedFilter(User), getAllUsers);
router.get('/users/export/csv', exportUsersCSV);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.put('/users/bulk/status', bulkUpdateUsersStatus);
router.delete('/users/:id', deleteUser);

// ========== Analytics Routes ==========
router.get('/analytics', getAnalytics);
router.get('/analytics/export', exportSalesReport);
router.get('/analytics/realtime', getRealtimeStats);

// ========== Transaction Routes ==========
router.get('/transactions', advancedFilter(Transaction, 'order user'), getAllTransactions);
router.get('/transactions/stats', getTransactionStats);
router.get('/transactions/export/csv', exportTransactionsCSV);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions/:id/refund', refundTransaction);
router.post('/transactions/reconcile', reconcileTransactions);

// ========== Review Routes ==========
router.get('/reviews', advancedFilter(Review, 'user food'), getAllReviews);
router.get('/reviews/stats', getReviewStats);
router.patch('/reviews/:id/approve', approveReview);
router.post('/reviews/:id/reply', replyToReview);
router.put('/reviews/bulk/approve', bulkApproveReviews);
router.delete('/reviews/:id', deleteReview);
router.delete('/reviews/bulk', bulkDeleteReviews);

// ========== Promo Code Routes ==========
router.get('/promo-codes', getAllPromoCodes);
router.post('/promo-codes', createPromoCode);
router.post('/promo-codes/validate', validatePromoCode);
router.get('/promo-codes/:id/stats', getPromoCodeStats);
router.put('/promo-codes/:id', updatePromoCode);
router.patch('/promo-codes/:id/status', togglePromoCodeStatus);
router.delete('/promo-codes/:id', deletePromoCode);

// ========== Settings Routes ==========
router.get('/settings', getSettings);
router.put('/settings/general', updateGeneralSettings);
router.put('/settings/payment', updatePaymentSettings);
router.put('/settings/orders', updateOrderSettings);
router.put('/settings/notifications', updateNotificationSettings);
router.put('/settings/profile', updateAdminProfile);
router.put('/settings/password', changePassword);

export default router;