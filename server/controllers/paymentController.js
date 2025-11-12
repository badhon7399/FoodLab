import Transaction from '../models/Transaction.js'
import Order from '../models/Order.js'
import asyncWrap from '../utils/asyncHandler.js'
import {
    createPaymentRequest,
    executePaymentRequest,
    queryPaymentRequest,
} from '../utils/bkashClient.js'

const CALLBACK_URL = process.env.BKASH_CALLBACK_URL || `${process.env.CLIENT_URL || ''}/payment/callback`

export const createPayment = asyncWrap(async (req, res) => {
    const { orderId } = req.body
    if (!orderId) {
        res.status(400)
        throw new Error('orderId is required')
    }
    const order = await Order.findById(orderId)
    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }
    if (order.status !== 'pending' && order.status !== 'paid') {
        res.status(400)
        throw new Error('Order cannot be paid in its current state')
    }

    const bkashResponse = await createPaymentRequest({
        amount: order.total,
        orderId: order._id,
        payerReference: req.userId,
        callbackURL: CALLBACK_URL,
    })

    if (bkashResponse.statusCode && bkashResponse.statusCode !== '0000') {
        res.status(400)
        throw new Error(bkashResponse.statusMessage || 'Failed to create payment')
    }

    const transaction = await Transaction.create({
        provider: 'bkash',
        amount: order.total,
        currency: 'BDT',
        status: 'initiated',
        reference: bkashResponse.paymentID,
        meta: {
            orderId: order._id,
            paymentID: bkashResponse.paymentID,
            createResponse: bkashResponse,
        },
    })

    order.transaction = transaction._id
    await order.save()

    res.json({
        success: true,
        data: {
            paymentID: bkashResponse.paymentID,
            bkashURL: bkashResponse.bkashURL,
            transactionId: transaction._id,
        },
    })
})

export const executePayment = asyncWrap(async (req, res) => {
    const { paymentID } = req.body
    if (!paymentID) {
        res.status(400)
        throw new Error('paymentID is required')
    }

    const transaction = await Transaction.findOne({ 'meta.paymentID': paymentID })
    if (!transaction) {
        res.status(404)
        throw new Error('Transaction not found')
    }

    const bkashResponse = await executePaymentRequest(paymentID)
    transaction.meta = {
        ...transaction.meta,
        executeResponse: bkashResponse,
    }

    if (bkashResponse.statusCode !== '0000') {
        transaction.status = 'failed'
        await transaction.save()
        res.status(400)
        throw new Error(bkashResponse.statusMessage || 'Payment execution failed')
    }

    transaction.status = 'success'
    transaction.reference = bkashResponse.trxID
    await transaction.save()

    const orderId = transaction.meta?.orderId
    let order
    if (orderId) {
        order = await Order.findById(orderId)
        if (order) {
            order.status = 'paid'
            order.transaction = transaction._id
            await order.save()
        }
    }

    res.json({
        success: true,
        data: {
            transaction,
            order,
            bkash: bkashResponse,
        },
    })
})

export const queryPayment = asyncWrap(async (req, res) => {
    const { paymentID } = req.params
    if (!paymentID) {
        res.status(400)
        throw new Error('paymentID is required')
    }

    const bkashResponse = await queryPaymentRequest(paymentID)
    res.json({ success: true, data: bkashResponse })
})
