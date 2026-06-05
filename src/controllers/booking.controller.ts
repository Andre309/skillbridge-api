import { Request, Response, NextFunction } from 'express'
import { bookingService } from '../services/booking.service'
import { ok, created, paginate } from '../utils/response'
import { CreateBookingDto, CancelBookingDto, BookingQueryDto } from '../validators/booking.validator'

export const bookingController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.create(req.user!.sub, req.body as CreateBookingDto)
      created(res, booking)
    } catch (e) { next(e) }
  },

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as 'mentee' | 'mentor') || 'mentee'
      const dto  = req.query as unknown as BookingQueryDto
      const result = await bookingService.getMyBookings(req.user!.sub, role, dto)
      paginate(res, result.items, result.total, result.page, result.limit)
    } catch (e) { next(e) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getById(req.params.id, req.user!.sub)
      ok(res, booking)
    } catch (e) { next(e) }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancel(req.params.id, req.user!.sub, req.body as CancelBookingDto)
      ok(res, booking)
    } catch (e) { next(e) }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.complete(req.params.id, req.user!.sub)
      ok(res, booking)
    } catch (e) { next(e) }
  },
}
