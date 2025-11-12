import User from '../models/User.js'
import Order from '../models/Order.js'
import asyncWrap from '../utils/asyncHandler.js'

function formatUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    hall: u.hall,
    department: u.department,
    studentId: u.studentId,
    avatar: u.avatar,
    role: u.role,
    createdAt: u.createdAt,
  }
}

export const getProfile = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  res.json({ user: formatUser(user) })
})

export const updateProfile = asyncWrap(async (req, res) => {
  const updatable = ['name', 'email', 'phone', 'hall', 'department', 'studentId']
  const updates = {}
  for (const k of updatable) if (req.body[k] !== undefined) updates[k] = req.body[k]

  if (updates.email) {
    const exists = await User.findOne({ email: updates.email, _id: { $ne: req.userId } })
    if (exists) {
      res.status(400)
      throw new Error('Email already in use')
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
  res.json({ user: formatUser(user) })
})

export const uploadAvatar = asyncWrap(async (req, res) => {
  // uploadUserAvatar middleware sets req.body.avatar and avatarPublicId
  if (!req.body.avatar) {
    res.status(400)
    throw new Error('No avatar uploaded')
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatar: req.body.avatar, avatarPublicId: req.body.avatarPublicId },
    { new: true }
  )
  res.json({ avatar: user.avatar })
})

export const getStats = asyncWrap(async (req, res) => {
  const orders = await Order.find({ user: req.userId })
  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  // Derive top items from orders
  const itemMap = new Map()
  for (const o of orders) {
    for (const it of o.items) {
      const key = it.name
      const prev = itemMap.get(key) || { name: it.name, image: it.image, count: 0, _id: it.food }
      prev.count += it.quantity
      itemMap.set(key, prev)
    }
  }
  const favoriteItems = Array.from(itemMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  res.json({ totalOrders, totalSpent, favoriteItems })
})

export const listAddresses = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  res.json(user.addresses || [])
})

export const createAddress = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  user.addresses = user.addresses || []
  const addr = {
    label: req.body.label,
    hall: req.body.hall,
    room: req.body.room,
    floor: req.body.floor,
    building: req.body.building,
    notes: req.body.notes,
    isDefault: !!req.body.isDefault,
  }
  if (!addr.hall || !addr.room) {
    res.status(400)
    throw new Error('Hall and room are required')
  }
  if (addr.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false))
  }
  user.addresses.push(addr)
  await user.save()
  res.status(201).json(user.addresses[user.addresses.length - 1])
})

export const updateAddress = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  const addr = user.addresses.id(req.params.id)
  if (!addr) {
    res.status(404)
    throw new Error('Address not found')
  }
  Object.assign(addr, {
    label: req.body.label ?? addr.label,
    hall: req.body.hall ?? addr.hall,
    room: req.body.room ?? addr.room,
    floor: req.body.floor ?? addr.floor,
    building: req.body.building ?? addr.building,
    notes: req.body.notes ?? addr.notes,
  })
  if (req.body.isDefault !== undefined) {
    if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false))
    addr.isDefault = !!req.body.isDefault
  }
  await user.save()
  res.json(addr)
})

export const deleteAddress = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  const addr = user.addresses.id(req.params.id)
  if (!addr) {
    res.status(404)
    throw new Error('Address not found')
  }
  addr.deleteOne()
  await user.save()
  res.json({ success: true })
})

export const setDefaultAddress = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  const addr = user.addresses.id(req.params.id)
  if (!addr) {
    res.status(404)
    throw new Error('Address not found')
  }
  user.addresses.forEach(a => (a.isDefault = false))
  addr.isDefault = true
  await user.save()
  res.json(addr)
})

export const getSettings = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  res.json(user.settings || {})
})

export const updateSettings = asyncWrap(async (req, res) => {
  const user = await User.findById(req.userId)
  user.settings = { ...(user.settings || {}), ...req.body }
  await user.save()
  res.json(user.settings)
})

export const changePassword = asyncWrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    res.status(400)
    throw new Error('Current and new password are required')
  }
  const user = await User.findById(req.userId).select('+password')
  const ok = await user.comparePassword(currentPassword)
  if (!ok) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }
  user.password = newPassword
  await user.save()
  res.json({ success: true })
})

export const deleteAccount = asyncWrap(async (req, res) => {
  await User.findByIdAndUpdate(req.userId, { isActive: false })
  res.json({ success: true })
})
