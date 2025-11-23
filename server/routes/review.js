import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createReview } from '../controllers/reviewController.js'

const router = Router()

router.post('/', auth, createReview)

export default router
