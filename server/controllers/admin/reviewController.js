import asyncHandler from 'express-async-handler';
import Review from '../../models/Review.js';
import Food from '../../models/Food.js';

// @desc    Get all reviews with filtering
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  res.json(res.advancedResults);
});

// @desc    Approve review
// @route   PATCH /api/admin/reviews/:id/approve
// @access  Private/Admin
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  )
    .populate('user', 'name')
    .populate('food', 'name');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Update food average rating
  await updateFoodRating(review.food._id);

  res.json({
    success: true,
    message: 'Review approved successfully',
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const foodId = review.food;
  await review.deleteOne();

  // Update food average rating
  await updateFoodRating(foodId);

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});

// @desc    Reply to review
// @route   POST /api/admin/reviews/:id/reply
// @access  Private/Admin
export const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;

  if (!reply) {
    res.status(400);
    throw new Error('Please provide a reply');
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      adminReply: reply,
      repliedBy: req.user._id,
      repliedAt: new Date(),
    },
    { new: true }
  )
    .populate('user', 'name')
    .populate('food', 'name');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // TODO: Send notification to user about admin reply

  res.json({
    success: true,
    message: 'Reply added successfully',
    data: review,
  });
});

// @desc    Bulk approve reviews
// @route   PUT /api/admin/reviews/bulk/approve
// @access  Private/Admin
export const bulkApproveReviews = asyncHandler(async (req, res) => {
  const { reviewIds } = req.body;

  if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
    res.status(400);
    throw new Error('Please provide review IDs');
  }

  const result = await Review.updateMany(
    { _id: { $in: reviewIds } },
    { $set: { isApproved: true } }
  );

  // Update ratings for all affected foods
  const reviews = await Review.find({ _id: { $in: reviewIds } });
  const foodIds = [...new Set(reviews.map((r) => r.food))];
  
  await Promise.all(foodIds.map((foodId) => updateFoodRating(foodId)));

  res.json({
    success: true,
    message: `${result.modifiedCount} reviews approved successfully`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Bulk delete reviews
// @route   DELETE /api/admin/reviews/bulk
// @access  Private/Admin
export const bulkDeleteReviews = asyncHandler(async (req, res) => {
  const { reviewIds } = req.body;

  if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
    res.status(400);
    throw new Error('Please provide review IDs');
  }

  const reviews = await Review.find({ _id: { $in: reviewIds } });
  const foodIds = [...new Set(reviews.map((r) => r.food))];

  const result = await Review.deleteMany({ _id: { $in: reviewIds } });

  // Update ratings for all affected foods
  await Promise.all(foodIds.map((foodId) => updateFoodRating(foodId)));

  res.json({
    success: true,
    message: `${result.deletedCount} reviews deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Get review statistics
// @route   GET /api/admin/reviews/stats
// @access  Private/Admin
export const getReviewStats = asyncHandler(async (req, res) => {
  const totalReviews = await Review.countDocuments();
  const approvedReviews = await Review.countDocuments({ isApproved: true });
  const pendingReviews = await Review.countDocuments({ isApproved: false });

  const ratingDistribution = await Review.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const avgRating = await Review.aggregate([
    { $match: { isApproved: true } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
      },
    },
  ]);

  const recentReviews = await Review.find()
    .populate('user', 'name')
    .populate('food', 'name image')
    .sort('-createdAt')
    .limit(5);

  res.json({
    success: true,
    data: {
      totalReviews,
      approvedReviews,
      pendingReviews,
      averageRating: avgRating[0]?.average || 0,
      ratingDistribution,
      recentReviews,
    },
  });
});

// Helper function to update food rating
const updateFoodRating = async (foodId) => {
  const result = await Review.aggregate([
    {
      $match: {
        food: foodId,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Food.findByIdAndUpdate(foodId, {
    rating: result[0]?.avgRating || 0,
    reviewCount: result[0]?.totalReviews || 0,
  });
};