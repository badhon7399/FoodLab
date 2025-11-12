import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import connectDb from './config/db.js'

import authRoutes from './routes/auth.js'
import foodRoutes from './routes/food.js'
import orderRoutes from './routes/order.js'
import paymentRoutes from './routes/payment.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

dotenv.config()
const app = express()

// CORS configuration - allow localhost with any port in development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production') {
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true)
            }
        }

        // In production, use CLIENT_URL from env
        const allowedOrigins = process.env.CLIENT_URL
            ? process.env.CLIENT_URL.split(',').map(url => url.trim())
            : []

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

app.set('trust proxy', 1)

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())
app.use(cors(corsOptions))
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))
app.use(apiLimiter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000
connectDb()
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`✅ Server running on port ${port}`)
        })
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} is already in use.`)
                console.error(`   Please either:`)
                console.error(`   1. Stop the process using port ${port}`)
                console.error(`   2. Set a different PORT in your .env file`)
                console.error(`   3. Run: netstat -ano | findstr :${port} to find the process`)
                process.exit(1)
            } else {
                console.error('❌ Server error:', err)
                process.exit(1)
            }
        })
    })
    .catch((err) => {
        console.error('❌ Failed to start server:', err)
        process.exit(1)
    })
