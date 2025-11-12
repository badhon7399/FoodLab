import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { uploadUserAvatar } from '../middleware/upload.js'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getStats,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount,
} from '../controllers/userController.js'

const router = Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

router.post('/upload-avatar', protect, uploadUserAvatar, uploadAvatar)

router.get('/stats', protect, getStats)

router.get('/addresses', protect, listAddresses)
router.post('/addresses', protect, createAddress)
router.put('/addresses/:id', protect, updateAddress)
router.delete('/addresses/:id', protect, deleteAddress)
router.put('/addresses/:id/default', protect, setDefaultAddress)

router.get('/settings', protect, getSettings)
router.put('/settings', protect, updateSettings)

router.put('/change-password', protect, changePassword)
router.delete('/account', protect, deleteAccount)

export default router
