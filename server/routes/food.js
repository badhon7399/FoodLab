import { Router } from 'express'
import auth from '../middleware/auth.js'
import admin from '../middleware/admin.js'
import { listFoods, getFood, createFood, updateFood, deleteFood, getPopularFoods, getFeaturedFoods, getNewArrivalFoods } from '../controllers/foodController.js'

const router = Router()

router.get('/', listFoods)
router.get('/popular', getPopularFoods)
router.get('/featured', getFeaturedFoods)
router.get('/new-arrival', getNewArrivalFoods)
router.get('/:id', getFood)

router.post('/', auth, admin, createFood)
router.put('/:id', auth, admin, updateFood)
router.delete('/:id', auth, admin, deleteFood)

export default router
