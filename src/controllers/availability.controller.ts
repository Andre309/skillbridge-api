import { Request, Response, NextFunction } from 'express'
import { availabilityService } from '../services/availability.service'
import { ok, created } from '../utils/response'
import { AvailabilityTemplateDto, AvailabilityOverrideDto, SlotsQueryDto } from '../validators/availability.validator'

const getMentorId = async (userId: string) => {
  const { prisma } = await import('../utils/prisma')
  const mp = await prisma.mentorProfile.findUnique({ where: { userId } })
  if (!mp) throw new Error('Профіль ментора не знайдено')
  return mp.id
}

export const availabilityController = {
  async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await availabilityService.getSlots(req.query as unknown as SlotsQueryDto)
      ok(res, slots)
    } catch (e) { next(e) }
  },

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = await getMentorId(req.user!.sub)
      const items = await availabilityService.getTemplates(mentorId)
      ok(res, items)
    } catch (e) { next(e) }
  },

  async upsertTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = await getMentorId(req.user!.sub)
      const item = await availabilityService.upsertTemplate(mentorId, req.body as AvailabilityTemplateDto)
      ok(res, item)
    } catch (e) { next(e) }
  },

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = await getMentorId(req.user!.sub)
      await availabilityService.deleteTemplate(mentorId, req.params.id)
      res.status(204).send()
    } catch (e) { next(e) }
  },

  async addOverride(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = await getMentorId(req.user!.sub)
      const item = await availabilityService.addOverride(mentorId, req.body as AvailabilityOverrideDto)
      created(res, item)
    } catch (e) { next(e) }
  },

  async getOverrides(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = await getMentorId(req.user!.sub)
      const { from, to } = req.query as any
      const items = await availabilityService.getOverrides(mentorId, from, to)
      ok(res, items)
    } catch (e) { next(e) }
  },
}