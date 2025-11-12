import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncWrap from '../utils/asyncHandler.js'

function signToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured')
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function formatUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user', // Use role field from User model
        phone: user.phone,
        hall: user.hall,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
    }
}

export const register = asyncWrap(async (req, res) => {
    const { name, email, password, phone, hall, department, studentId } = req.body
    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Name, email, and password are required')
    }
    const exists = await User.findOne({ email })
    if (exists) {
        res.status(400)
        throw new Error('Email already used')
    }
    const user = await User.create({ name, email, password, phone, hall, department, studentId })
    const token = signToken(user._id)
    res.status(201).json({ user: formatUser(user), token })
})

export const login = asyncWrap(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400)
        throw new Error('Email and password are required')
    }
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        res.status(400)
        throw new Error('Invalid credentials')
    }
    const ok = await user.comparePassword(password)
    if (!ok) {
        res.status(400)
        throw new Error('Invalid credentials')
    }
    const token = signToken(user._id)
    res.json({ user: formatUser(user), token })
})

export const me = asyncWrap(async (req, res) => {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    res.json({ user: formatUser(user) })
})
