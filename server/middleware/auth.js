import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // Support both 'id' and 'userId' in JWT payload
        const userId = payload.id || payload.userId
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }
        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is deactivated' })
        }
        req.user = user
        req.userId = user._id
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' })
    }
}

// Default export for backward compatibility
export default protect
