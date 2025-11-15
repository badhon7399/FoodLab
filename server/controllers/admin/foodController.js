import asyncHandler from 'express-async-handler';
import Food from '../../models/Food.js';
import { deleteImage } from '../../config/cloudinary.js';

// @desc    Get all food items with filtering
// @route   GET /api/admin/food
// @access  Private/Admin
export const getAllFoodItems = asyncHandler(async (req, res) => {
  res.json(res.advancedResults);
});

// @desc    Create new food item
// @route   POST /api/admin/food
// @access  Private/Admin
export const createFoodItem = asyncHandler(async (req, res) => {
  // If multiple images are provided, set primary image fields
  if (Array.isArray(req.body.images) && req.body.images.length > 0) {
    const idx = Number(req.body.primaryImageIndex ?? 0) || 0;
    const primary = req.body.images[idx] || req.body.images[0];
    if (primary?.url) {
      req.body.image = primary.url;
      req.body.imagePublicId = primary.publicId;
    }
  }

  const food = await Food.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Food item created successfully',
    data: food,
  });
});

// @desc    Update food item
// @route   PUT /api/admin/food/:id
// @access  Private/Admin
export const updateFoodItem = asyncHandler(async (req, res) => {
  let food = await Food.findById(req.params.id);

  if (!food) {
    res.status(404);
    throw new Error('Food item not found');
  }

  // If multiple images are provided, set primary image fields before updating
  if (Array.isArray(req.body.images) && req.body.images.length > 0) {
    const idx = Number(req.body.primaryImageIndex ?? 0) || 0;
    const primary = req.body.images[idx] || req.body.images[0];
    if (primary?.url) {
      req.body.image = primary.url;
      req.body.imagePublicId = primary.publicId;
    }
  }

  // If image is being updated, delete old image from Cloudinary
  if (req.body.image && req.body.image !== food.image && food.imagePublicId) {
    await deleteImage(food.imagePublicId);
  }

  food = await Food.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Food item updated successfully',
    data: food,
  });
});

// @desc    Delete food item
// @route   DELETE /api/admin/food/:id
// @access  Private/Admin
export const deleteFoodItem = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);

  if (!food) {
    res.status(404);
    throw new Error('Food item not found');
  }

  // Delete image from Cloudinary
  if (food.imagePublicId) {
    await deleteImage(food.imagePublicId);
  }

  await food.deleteOne();

  res.json({
    success: true,
    message: 'Food item deleted successfully',
  });
});

// @desc    Bulk delete food items
// @route   DELETE /api/admin/food/bulk
// @access  Private/Admin
export const bulkDeleteFoodItems = asyncHandler(async (req, res) => {
  const { foodIds } = req.body;

  if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0) {
    res.status(400);
    throw new Error('Please provide food item IDs');
  }

  // Get all food items to delete their images
  const foods = await Food.find({ _id: { $in: foodIds } });

  // Delete images from Cloudinary
  await Promise.all(
    foods.map(food => {
      if (food.imagePublicId) {
        return deleteImage(food.imagePublicId);
      }
    })
  );

  const result = await Food.deleteMany({ _id: { $in: foodIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} food items deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Bulk update food availability
// @route   PUT /api/admin/food/bulk/availability
// @access  Private/Admin
export const bulkUpdateAvailability = asyncHandler(async (req, res) => {
  const { foodIds, isAvailable } = req.body;

  if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0) {
    res.status(400);
    throw new Error('Please provide food item IDs');
  }

  const result = await Food.updateMany(
    { _id: { $in: foodIds } },
    { $set: { isAvailable } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} food items updated successfully`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Upload food image
// @route   POST /api/admin/food/upload
// @access  Private/Admin
export const uploadFoodImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: req.file.path,
      publicId: req.file.filename,
    },
  });
});