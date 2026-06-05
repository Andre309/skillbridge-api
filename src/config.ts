import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  PORT:                  z.coerce.number().default(4000),
  API_PREFIX:            z.string().default('/api/v1'),
  DATABASE_URL:          z.string().url(),
  REDIS_URL:             z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET:     z.string().min(16),
  JWT_REFRESH_SECRET:    z.string().min(16),
  JWT_ACCESS_EXPIRES:    z.string().default('15m'),
  JWT_REFRESH_EXPIRES:   z.string().default('30d'),
  GOOGLE_CLIENT_ID:      z.string().optional(),
  GOOGLE_CLIENT_SECRET:  z.string().optional(),
  GITHUB_CLIENT_ID:      z.string().optional(),
  GITHUB_CLIENT_SECRET:  z.string().optional(),
  OAUTH_CALLBACK_BASE_URL: z.string().default('http://localhost:4000/api/v1/auth'),
  STRIPE_SECRET_KEY:     z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PLATFORM_FEE_PCT: z.coerce.number().default(20),
  RESEND_API_KEY:        z.string().optional(),
  EMAIL_FROM:            z.string().email().default('noreply@skillbridge.com'),
  FRONTEND_URL:          z.string().default('http://localhost:3000'),
  S3_BUCKET:             z.string().optional(),
  S3_REGION:             z.string().optional(),
  S3_ACCESS_KEY:         z.string().optional(),
  S3_SECRET_KEY:         z.string().optional(),
  S3_ENDPOINT:           z.string().optional(),
  DAILY_API_KEY:         z.string().optional(),
  DAILY_DOMAIN:          z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Невалідні змінні середовища:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
export type Config = typeof config
