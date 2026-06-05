import { Request, Response, NextFunction } from 'express'
import { mentorService } from '../services/mentor.service'
import { ok, paginate } from '../utils/response'
import { MentorSearchDto } from '../validators/mentor.validator'

export const mentorController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.query as unknown as MentorSearchDto
      const result = await mentorService.search(dto)
      paginate(res, result.items, result.total, result.page, result.limit)
    } catch (e) { next(e) }
  },

  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const mentor = await mentorService.getPublicProfile(req.params.id)
      ok(res, mentor)
    } catch (e) { next(e) }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await mentorService.getProfile(req.user!.sub)
      ok(res, profile)
    } catch (e) { next(e) }
  },

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await mentorService.updateProfile(req.user!.sub, req.body)
      ok(res, profile)
    } catch (e) { next(e) }
  },

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query as any
      const result = await mentorService.getReviews(req.params.id, +page, +limit)
      paginate(res, result.items, result.total, result.page, result.limit)
    } catch (e) { next(e) }
  },
}
