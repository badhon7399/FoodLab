import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createPayment, executePayment, queryPayment } from '../controllers/paymentController.js'

const router = Router()

router.post('/initiate', auth, createPayment)
router.post('/execute', auth, executePayment)
router.get('/status/:paymentID', auth, queryPayment)

export default router
