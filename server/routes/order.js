import { Router } from 'express'
import auth from '../middleware/auth.js'
import admin from '../middleware/admin.js'
import { createOrder, listMyOrders, getOrder, adminListOrders, adminUpdateStatus } from '../controllers/orderController.js'

const router = Router()

router.post('/', auth, createOrder)
router.get('/me', auth, listMyOrders)
router.get('/my-orders', auth, listMyOrders)
router.get('/:id', auth, getOrder)

router.get('/', auth, admin, adminListOrders)
router.patch('/:id/status', auth, admin, adminUpdateStatus)

export default router
