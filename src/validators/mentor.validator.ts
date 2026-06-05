import { z } from 'zod'

export const mentorProfileSchema = z.object({
  headline:        z.string().max(200).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  company:         z.string().max(150).optional(),
  position:        z.string().max(150).optional(),
  linkedinUrl:     z.string().url().optional().or(z.literal('')),
  githubUrl:       z.string().url().optional().or(z.literal('')),
  websiteUrl:      z.string().url().optional().or(z.literal('')),
  languages:       z.array(z.string().length(2)).default([]),
  introVideoUrl:   z.string().url().optional(),
})

export const mentorSearchSchema = z.object({
  q:          z.string().optional(),
  category:   z.string().optional(),
  minPrice:   z.coerce.number().optional(),
  maxPrice:   z.coerce.number().optional(),
  lang:       z.string().optional(),
  rating:     z.coerce.number().min(1).max(5).optional(),
  featured:   z.coerce.boolean().optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(50).default(12),
  sort:       z.enum(['rating', 'price_asc', 'price_desc', 'sessions']).default('rating'),
})

export type MentorProfileDto = z.infer<typeof mentorProfileSchema>
export type MentorSearchDto  = z.infer<typeof mentorSearchSchema>
