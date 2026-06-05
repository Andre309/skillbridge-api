import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const availabilityTemplateSchema = z.object({
  day:       z.enum(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']),
  startTime: z.string().regex(timeRegex, 'Формат: HH:mm'),
  endTime:   z.string().regex(timeRegex, 'Формат: HH:mm'),
  isActive:  z.boolean().default(true),
})

export const availabilityOverrideSchema = z.object({
  date:      z.string().date(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime:   z.string().regex(timeRegex).optional(),
  reason:    z.string().max(200).optional(),
})

export const slotsQuerySchema = z.object({
  date:      z.string().date(),
  serviceId: z.string().uuid(),
})

export type AvailabilityTemplateDto = z.infer<typeof availabilityTemplateSchema>
export type AvailabilityOverrideDto = z.infer<typeof availabilityOverrideSchema>
export type SlotsQueryDto           = z.infer<typeof slotsQuerySchema>
