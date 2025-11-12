import asyncHandler from 'express-async-handler';
import PromoCode from '../../models/PromoCode.js';
import Order from '../../models/Order.js';

// @desc    Get all promo codes
// @route   GET /api/admin/promo-codes
// @access  Private/Admin
export const getAllPromoCodes = asyncHandler(async (req, res) => {
  const promoCodes = await PromoCode.find().sort('-createdAt');

  res.json({
    success: true,
    count: promoCodes.length,
    data: promoCodes,
  });
});

// @desc    Create promo code
// @route   POST /api/admin/promo-codes
// @access  Private/Admin
export const createPromoCode = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit,
    isActive,
  } = req.body;

  // Check if code already exists
  const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existingCode) {
    res.status(400);
    throw new Error('Promo code already exists');
  }

  const promoCode = await PromoCode.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit,
    isActive,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Promo code created successfully',
    data: promoCode,
  });
});

// @desc    Update promo code
// @route   PUT /api/admin/promo-codes/:id
// @access  Private/Admin
export const updatePromoCode = asyncHandler(async (req, res) => {
  let promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }

  // If updating code, check for duplicates
  if (req.body.code && req.body.code !== promoCode.code) {
    const existingCode = await PromoCode.findOne({
      code: req.body.code.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existingCode) {
      res.status(400);
      throw new Error('Promo code already exists');
    }

    req.body.code = req.body.code.toUpperCase();
  }

  promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Promo code updated successfully',
    data: promoCode,
  });
});

// @desc    Delete promo code
// @route   DELETE /api/admin/promo-codes/:id
// @access  Private/Admin
export const deletePromoCode = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }

  await promoCode.deleteOne();

  res.json({
    success: true,
    message: 'Promo code deleted successfully',
  });
});

// @desc    Toggle promo code status
// @route   PATCH /api/admin/promo-codes/:id/status
// @access  Private/Admin
export const togglePromoCodeStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const promoCode = await PromoCode.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }

  res.json({
    success: true,
    message: `Promo code ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: promoCode,
  });
});

// @desc    Get promo code usage statistics
// @route   GET /api/admin/promo-codes/:id/stats
// @access  Private/Admin
export const getPromoCodeStats = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }

  // Get orders that used this promo code
  const orders = await Order.find({ promoCode: promoCode.code });

  const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  res.json({
    success: true,
    data: {
      promoCode,
      usage: {
        totalUses: promoCode.usedCount,
        remainingUses: promoCode.usageLimit 
          ? promoCode.usageLimit - promoCode.usedCount 
          : 'Unlimited',
        totalDiscount,
        totalRevenue,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      },
      recentOrders: orders.slice(0, 10),
    },
  });
});

// @desc    Validate promo code (for testing)
// @route   POST /api/admin/promo-codes/validate
// @access  Private/Admin
export const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }

  // Check if active
  if (!promoCode.isActive) {
    res.status(400);
    throw new Error('Promo code is not active');
  }

  // Check validity period
  const now = new Date();
  if (promoCode.validFrom && now < new Date(promoCode.validFrom)) {
    res.status(400);
    throw new Error('Promo code not yet valid');
  }

  if (promoCode.validUntil && now > new Date(promoCode.validUntil)) {
    res.status(400);
    throw new Error('Promo code has expired');
  }

  // Check usage limit
  if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
    res.status(400);
    throw new Error('Promo code usage limit reached');
  }

  // Check minimum order amount
  if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
    res.status(400);
    throw new Error(
      `Minimum order amount is ৳${promoCode.minOrderAmount}`
    );
  }

  // Calculate discount
  let discount = 0;
  if (promoCode.discountType === 'percentage') {
    discount = (orderAmount * promoCode.discountValue) / 100;
    if (promoCode.maxDiscount) {
      discount = Math.min(discount, promoCode.maxDiscount);
    }
  } else {
    discount = promoCode.discountValue;
  }

  res.json({
    success: true,
    message: 'Promo code is valid',
    data: {
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      calculatedDiscount: discount,
      finalAmount: orderAmount - discount,
    },
  });
});