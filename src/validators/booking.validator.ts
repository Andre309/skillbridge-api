import { z } from 'zod'

export const createBookingSchema = z.object({
  serviceId:   z.string().uuid(),
  scheduledAt: z.string().datetime(),
  notes:       z.string().max(500).optional(),
  promoCode:   z.string().max(30).optional(),
})

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
})

export const bookingQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  from:   z.string().datetime().optional(),
  to:     z.string().datetime().optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(10),
})

export type CreateBookingDto = z.infer<typeof createBookingSchema>
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>
export type BookingQueryDto  = z.infer<typeof bookingQuerySchema>
