import Order from '../models/Order.js'
import asyncWrap from '../utils/asyncHandler.js'

export const createOrder = asyncWrap(async (req, res) => {
    const {
        items,
        deliveryDetails,
        subtotal,
        deliveryFee = 0,
        discount = 0,
        tax = 0,
        totalAmount,
        paymentMethod,
        promoCode,
    } = req.body

    if (!Array.isArray(items) || items.length === 0) {
        res.status(400)
        throw new Error('Order items are required')
    }

    // Compute subtotal from items when not provided or invalid
    const computedSubtotal = typeof subtotal === 'number' && !Number.isNaN(subtotal)
        ? subtotal
        : items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)

    const df = Number(deliveryFee) || 0
    const dc = Number(discount) || 0
    const tx = Number(tax) || 0

    if (!paymentMethod) {
        res.status(400)
        throw new Error('Payment method is required')
    }

    const computedTotal = typeof totalAmount === 'number' && !Number.isNaN(totalAmount)
        ? totalAmount
        : computedSubtotal + df + tx - dc

    if ([computedSubtotal, df, dc, tx, computedTotal].some(n => typeof n !== 'number' || Number.isNaN(n))) {
        res.status(400)
        throw new Error('Order amounts must be valid numbers')
    }

    const order = await Order.create({
        user: req.userId,
        items,
        deliveryDetails,
        subtotal: computedSubtotal,
        deliveryFee: df,
        discount: dc,
        tax: tx,
        totalAmount: computedTotal,
        paymentMethod,
        promoCode,
    })

    res.status(201).json({ success: true, order })
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
