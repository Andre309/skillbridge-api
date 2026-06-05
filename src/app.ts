import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { config } from './config'
import { logger } from './utils/logger'
import { apiLimiter, errorMiddleware } from './middleware'

import authRoutes         from './routes/auth.routes'
import mentorRoutes       from './routes/mentor.routes'
import serviceRoutes      from './routes/service.routes'
import bookingRoutes      from './routes/booking.routes'
import reviewRoutes       from './routes/review.routes'
import availabilityRoutes from './routes/availability.routes'
import categoryRoutes     from './routes/category.routes'
import paymentRoutes      from './routes/payment.routes'
import notificationRoutes from './routes/notification.routes'

const app = express()

// ── Security ────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      config.FRONTEND_URL,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ── Parsing ──────────────────────────────────────────────────────────────
// NOTE: /payments/webhook needs raw body — mounted BEFORE json()
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Misc ─────────────────────────────────────────────────────────────────
app.use(compression())
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}))

// ── Rate limiting ─────────────────────────────────────────────────────────
app.use(config.API_PREFIX, apiLimiter)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status:  'ok',
  service: 'skillbridge-api',
  env:     config.NODE_ENV,
  ts:      new Date().toISOString(),
}))

// ── API Routes ────────────────────────────────────────────────────────────
const prefix = config.API_PREFIX
app.use(`${prefix}/auth`,          authRoutes)
app.use(`${prefix}/mentors`,       mentorRoutes)
app.use(`${prefix}/services`,      serviceRoutes)
app.use(`${prefix}/bookings`,      bookingRoutes)
app.use(`${prefix}/reviews`,       reviewRoutes)
app.use(`${prefix}/availability`,  availabilityRoutes)
app.use(`${prefix}/categories`,    categoryRoutes)
app.use(`${prefix}/payments`,      paymentRoutes)
app.use(`${prefix}/notifications`, notificationRoutes)

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({
  success: false, error: 'NOT_FOUND', message: 'Маршрут не знайдено',
}))

// ── Error Handler ──────────────────────────────────────────────────────────
app.use(errorMiddleware)

export default app