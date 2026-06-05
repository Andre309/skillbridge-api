import { z } from 'zod'

export const serviceSchema = z.object({
  categoryId:        z.string().uuid().optional(),
  title:             z.string().min(5).max(200),
  description:       z.string().max(2000).optional(),
  durationMinutes:   z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)]),
  priceCents:        z.number().int().min(100),   // мінімум $1
  currency:          z.string().length(3).default('USD'),
  maxBookingsPerDay: z.number().int().min(1).max(20).default(5),
  isActive:          z.boolean().default(true),
  isTrial:           z.boolean().default(false),
  tags:              z.array(z.string().max(30)).max(10).default([]),
})

export type ServiceDto = z.infer<typeof serviceSchema>
