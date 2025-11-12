import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import { emitOrderStatusUpdate } from '../../socket/events.js';

// @desc    Get all orders with filtering
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  // Using advancedFilter middleware result
  res.json(res.advancedResults);
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.food', 'name price image category');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;

  // If delivered, update payment status if COD
  if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
    order.paymentStatus = 'Completed';
  }

  await order.save();

  // Emit real-time update
  const io = req.app.get('io');
  emitOrderStatusUpdate(io, order._id, status, order.user);

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

// @desc    Bulk update order status
// @route   PUT /api/admin/orders/bulk/status
// @access  Private/Admin
export const bulkUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { orderIds, status } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400);
    throw new Error('Please provide order IDs');
  }

  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const result = await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: { status } }
  );

  // Emit real-time updates for each order
  const io = req.app.get('io');
  const orders = await Order.find({ _id: { $in: orderIds } });
  
  orders.forEach(order => {
    emitOrderStatusUpdate(io, order._id, status, order.user);
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} orders updated successfully`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow deletion of cancelled orders
  if (order.status !== 'Cancelled') {
    res.status(400);
    throw new Error('Only cancelled orders can be deleted');
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
});

// @desc    Bulk delete orders
// @route   DELETE /api/admin/orders/bulk
// @access  Private/Admin
export const bulkDeleteOrders = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400);
    throw new Error('Please provide order IDs');
  }

  // Only delete cancelled orders
  const result = await Order.deleteMany({
    _id: { $in: orderIds },
    status: 'Cancelled',
  });

  res.json({
    success: true,
    message: `${result.deletedCount} orders deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Export orders to CSV
// @route   GET /api/admin/orders/export/csv
// @access  Private/Admin
export const exportOrdersCSV = asyncHandler(async (req, res) => {
  const { exportOrdersToCSV } = await import('../../utils/exportCSV.js');

  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.food', 'name')
    .sort('-createdAt');

  const filepath = await exportOrdersToCSV(orders);

  res.download(filepath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Delete file after download
    setTimeout(() => {
      fs.unlinkSync(filepath);
    }, 1000);
  });
});

// @desc    Export orders to PDF
// @route   GET /api/admin/orders/export/pdf
// @access  Private/Admin
export const exportOrdersPDF = asyncHandler(async (req, res) => {
  const { exportOrdersToPDF } = await import('../../utils/exportPDF.js');

  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.food', 'name price')
    .sort('-createdAt')
    .limit(100);

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
      : 0,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    completedOrders: orders.filter(o => o.status === 'Delivered').length,
  };

  const filepath = await exportOrdersToPDF(orders, stats);

  res.download(filepath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    setTimeout(() => {
      fs.unlinkSync(filepath);
    }, 1000);
  });
});