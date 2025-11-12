import asyncWrap from '../../utils/asyncHandler.js';
import Settings from '../../models/Settings.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = asyncWrap(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      siteName: 'Food Lab',
      siteDescription: 'Tasty, Healthy, Hygienic - Made for Cuetians',
      contactEmail: 'support@foodlab.com',
      contactPhone: '+880 1234567890',
    });
  }

  res.json({
    success: true,
    data: settings,
  });
});

// @desc    Update general settings
// @route   PUT /api/admin/settings/general
// @access  Private/Admin
export const updateGeneralSettings = asyncWrap(async (req, res) => {
  const {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    logo,
    favicon,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings.siteName = siteName || settings.siteName;
    settings.siteDescription = siteDescription || settings.siteDescription;
    settings.contactEmail = contactEmail || settings.contactEmail;
    settings.contactPhone = contactPhone || settings.contactPhone;
    settings.address = address || settings.address;
    settings.logo = logo || settings.logo;
    settings.favicon = favicon || settings.favicon;

    await settings.save();
  }

  res.json({
    success: true,
    message: 'General settings updated successfully',
    data: settings,
  });
});

// @desc    Update payment settings
// @route   PUT /api/admin/settings/payment
// @access  Private/Admin
export const updatePaymentSettings = asyncWrap(async (req, res) => {
  const {
    bkashEnabled,
    bkashMerchantNumber,
    codEnabled,
    deliveryFee,
    freeDeliveryThreshold,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  settings.payment = {
    bkashEnabled: bkashEnabled ?? settings.payment?.bkashEnabled ?? true,
    bkashMerchantNumber: bkashMerchantNumber || settings.payment?.bkashMerchantNumber,
    codEnabled: codEnabled ?? settings.payment?.codEnabled ?? true,
    deliveryFee: deliveryFee ?? settings.payment?.deliveryFee ?? 30,
    freeDeliveryThreshold:
      freeDeliveryThreshold ?? settings.payment?.freeDeliveryThreshold ?? 200,
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Payment settings updated successfully',
    data: settings,
  });
});

// @desc    Update order settings
// @route   PUT /api/admin/settings/orders
// @access  Private/Admin
export const updateOrderSettings = asyncWrap(async (req, res) => {
  const {
    orderPrefix,
    autoApprove,
    minOrderAmount,
    maxOrderAmount,
    estimatedDeliveryTime,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  settings.orders = {
    orderPrefix: orderPrefix || settings.orders?.orderPrefix || 'ORD',
    autoApprove: autoApprove ?? settings.orders?.autoApprove ?? false,
    minOrderAmount: minOrderAmount ?? settings.orders?.minOrderAmount ?? 0,
    maxOrderAmount: maxOrderAmount ?? settings.orders?.maxOrderAmount ?? 5000,
    estimatedDeliveryTime:
      estimatedDeliveryTime ?? settings.orders?.estimatedDeliveryTime ?? 30,
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Order settings updated successfully',
    data: settings,
  });
});

// @desc    Update notification settings
// @route   PUT /api/admin/settings/notifications
// @access  Private/Admin
export const updateNotificationSettings = asyncWrap(async (req, res) => {
  const {
    emailNewOrder,
    emailNewUser,
    emailLowStock,
    pushNewOrder,
    pushPaymentReceived,
    pushNewReview,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  settings.notifications = {
    emailNewOrder: emailNewOrder ?? settings.notifications?.emailNewOrder ?? true,
    emailNewUser: emailNewUser ?? settings.notifications?.emailNewUser ?? true,
    emailLowStock: emailLowStock ?? settings.notifications?.emailLowStock ?? false,
    pushNewOrder: pushNewOrder ?? settings.notifications?.pushNewOrder ?? true,
    pushPaymentReceived:
      pushPaymentReceived ?? settings.notifications?.pushPaymentReceived ?? true,
    pushNewReview: pushNewReview ?? settings.notifications?.pushNewReview ?? false,
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: settings,
  });
});

// @desc    Update admin profile
// @route   PUT /api/admin/settings/profile
// @access  Private/Admin
export const updateAdminProfile = asyncWrap(async (req, res) => {
  const { name, email, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.avatar = avatar || user.avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/settings/password
// @access  Private/Admin
export const changePassword = asyncWrap(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('New passwords do not match');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Hash and save new password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});