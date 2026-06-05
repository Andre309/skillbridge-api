import { Request, Response, NextFunction } from 'express'
import { serviceService } from '../services/service.service'
import { ok, created } from '../utils/response'
import { ServiceDto } from '../validators/service.validator'

export const serviceController = {
  async getByMentor(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await serviceService.getByMentor(req.params.mentorId)
      ok(res, items)
    } catch (e) { next(e) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.create(req.user!.sub, req.body as ServiceDto)
      created(res, service)
    } catch (e) { next(e) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.update(req.params.id, req.user!.sub, req.body)
      ok(res, service)
    } catch (e) { next(e) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await serviceService.delete(req.params.id, req.user!.sub)
      res.status(204).send()
    } catch (e) { next(e) }
  },
}
