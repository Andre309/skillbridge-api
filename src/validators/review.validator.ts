import { z } from 'zod'

export const createReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export const mentorReplySchema = z.object({
  reply: z.string().min(1).max(500),
})

export type CreateReviewDto = z.infer<typeof createReviewSchema>
export type MentorReplyDto  = z.infer<typeof mentorReplySchema>
