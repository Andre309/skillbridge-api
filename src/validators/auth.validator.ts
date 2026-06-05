import { z } from 'zod'

export const registerSchema = z.object({
  email:       z.string().email('Невалідний email'),
  password:    z.string().min(8, 'Пароль мінімум 8 символів').max(100),
  fullName:    z.string().min(2).max(150),
  displayName: z.string().max(80).optional(),
  timezone:    z.string().default('UTC'),
  locale:      z.string().default('uk'),
  role:        z.enum(['mentee', 'mentor', 'both']).default('mentee'),
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(100),
})

export type RegisterDto        = z.infer<typeof registerSchema>
export type LoginDto           = z.infer<typeof loginSchema>
export type RefreshDto         = z.infer<typeof refreshSchema>
export type ForgotPasswordDto  = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDto   = z.infer<typeof resetPasswordSchema>
