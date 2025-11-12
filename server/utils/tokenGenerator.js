import jwt from 'jsonwebtoken'

export function generateToken(userId, expiresIn = '7d') {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn })
}
