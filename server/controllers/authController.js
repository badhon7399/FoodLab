import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncWrap from '../utils/asyncHandler.js'
import { sendEmail } from '../utils/emailService.js'

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

// Request password reset link
export const forgotPassword = asyncWrap(async (req, res) => {
    const { email } = req.body
    if (!email) {
        res.status(400)
        throw new Error('Email is required')
    }

    const user = await User.findOne({ email })
    if (!user) {
        // Do not reveal whether email exists
        return res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
    }

    const token = user.generateResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const clientBase = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'
    const resetUrl = `${clientBase.replace(/\/$/, '')}/#/reset-password?token=${encodeURIComponent(token)}`

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Reset your Food Lab password</h2>
          <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a></p>
          <p>Or paste this link into your browser:<br /><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
    `

    await sendEmail({
        to: user.email,
        subject: 'Reset your Food Lab password',
        html,
        text: `Reset your password: ${resetUrl}`,
    })

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
})

// Reset password with token
export const resetPassword = asyncWrap(async (req, res) => {
    const { token, password } = req.body
    if (!token || !password) {
        res.status(400)
        throw new Error('Token and new password are required')
    }

    // Validate token and expiry
    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        res.status(400)
        throw new Error('Invalid or expired token')
    }

    const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } }).select('+password')
    if (!user) {
        res.status(400)
        throw new Error('Invalid or expired token')
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ success: true, message: 'Password has been reset successfully' })
})
