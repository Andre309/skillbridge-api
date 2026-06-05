import { Router } from 'express'
import { bookingController } from '../controllers/booking.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, bookingLimiter } from '../middleware'
import { createBookingSchema, cancelBookingSchema, bookingQuerySchema } from '../validators/booking.validator'

const router = Router()

router.post('/',             authenticate, bookingLimiter, validate(createBookingSchema), bookingController.create)
router.get('/',              authenticate, validate(bookingQuerySchema, 'query'),          bookingController.getMyBookings)
router.get('/:id',           authenticate,                                                 bookingController.getById)
router.patch('/:id/cancel',  authenticate, validate(cancelBookingSchema),                 bookingController.cancel)
router.patch('/:id/complete',authenticate,                                                 bookingController.complete)

export default router