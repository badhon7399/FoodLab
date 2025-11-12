import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import Order from '../../models/Order.js';

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  res.json(res.advancedResults);
});

// @desc    Get user details with stats
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
  ]);

  const activeOrders = await Order.countDocuments({
    user: user._id,
    status: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
  });

  res.json({
    success: true,
    data: {
      user,
      stats: {
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalSpent: orderStats[0]?.totalSpent || 0,
        averageOrderValue: orderStats[0]?.averageOrderValue || 0,
        activeOrders,
      },
    },
  });
});

// @desc    Update user status (ban/activate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user,
  });
});

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Don't allow deleting own account
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  // Check if user has active orders
  const activeOrders = await Order.countDocuments({
    user: user._id,
    status: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
  });

  if (activeOrders > 0) {
    res.status(400);
    throw new Error('Cannot delete user with active orders');
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Bulk update users status
// @route   PUT /api/admin/users/bulk/status
// @access  Private/Admin
export const bulkUpdateUsersStatus = asyncHandler(async (req, res) => {
  const { userIds, isActive } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    res.status(400);
    throw new Error('Please provide user IDs');
  }

  // Don't allow changing own status
  if (userIds.includes(req.user._id.toString())) {
    res.status(400);
    throw new Error('Cannot change your own status');
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { isActive } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Export users to CSV
// @route   GET /api/admin/users/export/csv
// @access  Private/Admin
export const exportUsersCSV = asyncHandler(async (req, res) => {
  const { exportUsersToCSV } = await import('../../utils/exportCSV.js');

  const users = await User.find().select('-password').sort('-createdAt');

  const filepath = await exportUsersToCSV(users);

  res.download(filepath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    setTimeout(() => {
      fs.unlinkSync(filepath);
    }, 1000);
  });
});