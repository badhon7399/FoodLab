import { Router } from 'express'
import validate from '../middleware/validation.js'
import auth from '../middleware/auth.js'
import { register, login, me, forgotPassword, resetPassword } from '../controllers/authController.js'

const router = Router()

router.post('/register', validate(['name', 'email', 'password', 'phone', 'hall']), register)
router.post('/login', validate(['email', 'password']), login)
router.get('/me', auth, me)

// Password reset
router.post('/forgot-password', validate(['email']), forgotPassword)
router.post('/reset-password', validate(['token', 'password']), resetPassword)

export default router
