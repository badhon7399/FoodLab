import Food from '../models/Food.js'
import asyncWrap from '../utils/asyncHandler.js'

export const listFoods = asyncWrap(async (req, res) => {
    const query = req.query.includeInactive === 'true' ? {} : { isAvailable: true }
    const foods = await Food.find(query).sort('-createdAt')
    res.json({ success: true, data: foods })
})

// @desc    Get popular foods
// @route   GET /api/food/popular
export const getPopularFoods = asyncWrap(async (req, res) => {
    const foods = await Food.find({ isAvailable: true, isPopular: true })
        .sort('-soldCount -rating')
        .limit(12)
    res.json({ success: true, data: foods })
})

// @desc    Get featured foods
// @route   GET /api/food/featured
export const getFeaturedFoods = asyncWrap(async (req, res) => {
    const foods = await Food.find({ isAvailable: true, isFeatured: true })
        .sort('-rating -soldCount')
        .limit(12)
    res.json({ success: true, data: foods })
})

// @desc    Get new arrival foods
// @route   GET /api/food/new-arrival
export const getNewArrivalFoods = asyncWrap(async (req, res) => {
    const foods = await Food.find({ isAvailable: true, isNewArrival: true })
        .sort('-createdAt')
        .limit(12)
    res.json({ success: true, data: foods })
})

export const getFood = asyncWrap(async (req, res) => {
    const food = await Food.findById(req.params.id)
    if (!food) {
        res.status(404)
        throw new Error('Food not found')
    }
    res.json({ success: true, data: food })
})

export const createFood = asyncWrap(async (req, res) => {
    const required = ['title', 'price']
    for (const field of required) {
        if (!req.body[field]) {
            res.status(400)
            throw new Error(`Missing field: ${field}`)
        }
    }
    const food = await Food.create(req.body)
    res.status(201).json({ success: true, data: food })
})

export const updateFood = asyncWrap(async (req, res) => {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!food) {
        res.status(404)
        throw new Error('Food not found')
    }
    res.json({ success: true, data: food })
})

export const deleteFood = asyncWrap(async (req, res) => {
    const deleted = await Food.findByIdAndDelete(req.params.id)
    if (!deleted) {
        res.status(404)
        throw new Error('Food not found')
    }
    res.status(204).json({ success: true })
})
