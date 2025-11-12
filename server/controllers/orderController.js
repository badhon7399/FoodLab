import Order from '../models/Order.js'
import asyncWrap from '../utils/asyncHandler.js'

export const createOrder = asyncWrap(async (req, res) => {
    const { items, total, address } = req.body
    if (!Array.isArray(items) || items.length === 0) {
        res.status(400)
        throw new Error('Order items are required')
    }
    if (typeof total !== 'number') {
        res.status(400)
        throw new Error('Order total must be a number')
    }
    const order = await Order.create({ user: req.userId, items, total, address })
    res.status(201).json({ success: true, data: order })
})

export const listMyOrders = asyncWrap(async (req, res) => {
    const orders = await Order.find({ user: req.userId }).sort('-createdAt')
    const mapped = orders.map((o) => ({
        _id: o._id,
        orderNumber: o.orderId,
        status: (o.status || 'Pending').toString().toLowerCase(),
        createdAt: o.createdAt,
        items: o.items.map(it => ({
            name: it.name,
            image: it.image,
            price: it.price,
            quantity: it.quantity,
        })),
        total: o.totalAmount ?? o.total ?? 0,
        deliveryFee: o.deliveryFee ?? 0,
        hall: o.deliveryDetails?.hall,
        room: o.deliveryDetails?.roomNumber,
        phone: o.deliveryDetails?.phone,
        notes: o.deliveryDetails?.instructions,
        deliverySlot: o.estimatedDeliveryTime ? new Date(o.estimatedDeliveryTime).toLocaleString() : undefined,
    }))
    res.json(mapped)
})

export const getOrder = asyncWrap(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId })
    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }
    res.json({ success: true, data: order })
})

export const adminListOrders = asyncWrap(async (req, res) => {
    const orders = await Order.find({}).sort('-createdAt')
    res.json({ success: true, data: orders })
})

export const adminUpdateStatus = asyncWrap(async (req, res) => {
    const { status } = req.body
    if (!status) {
        res.status(400)
        throw new Error('Status is required')
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }
    res.json({ success: true, data: order })
})
