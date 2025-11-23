import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import asyncWrap from '../utils/asyncHandler.js';

// @desc    Get reviews for a food
// @route   GET /api/food/:id/reviews
export const getFoodReviews = asyncWrap(async (req, res) => {
    const reviews = await Review.find({ food: req.params.id, isApproved: true })
        .populate('user', 'name')
        .sort('-createdAt')

    res.json({ success: true, data: reviews })
})

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncWrap(async (req, res) => {
    const { rating, comment, order: orderId, food: foodId } = req.body
    const userId = req.user._id

    let targetFoodId = foodId

    if (orderId) {
        const order = await Order.findById(orderId)
        if (!order) {
            res.status(404)
            throw new Error('Order not found')
        }
        // If no foodId provided, use the first item's food
        if (!targetFoodId && order.items && order.items.length > 0) {
            targetFoodId = order.items[0].food
        }

        // Update order with rating/review
        order.rating = rating
        order.review = comment
        await order.save()
    }

    if (!targetFoodId) {
        res.status(400)
        throw new Error('Food ID is required')
    }

    // Check if review already exists for this user and food
    const existingReview = await Review.findOne({ user: userId, food: targetFoodId })
    if (existingReview) {
        res.status(400)
        throw new Error('You have already reviewed this food')
    }

    const review = await Review.create({
        user: userId,
        food: targetFoodId,
        order: orderId,
        rating,
        comment,
        isApproved: true
    })

    res.status(201).json({ success: true, data: review })
})
