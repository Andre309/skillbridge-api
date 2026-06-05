import { Request, Response, NextFunction } from 'express'
import { reviewService } from '../services/review.service'
import { created, ok } from '../utils/response'
import { CreateReviewDto, MentorReplyDto } from '../validators/review.validator'

export const reviewController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.create(req.params.bookingId, req.user!.sub, req.body as CreateReviewDto)
      created(res, review)
    } catch (e) { next(e) }
  },

  async addMentorReply(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.addMentorReply(req.params.bookingId, req.user!.sub, req.body as MentorReplyDto)
      ok(res, review)
    } catch (e) { next(e) }
  },
}
