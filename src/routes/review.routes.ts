import { Router } from 'express'
import { reviewController } from '../controllers/review.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate } from '../middleware'
import { createReviewSchema, mentorReplySchema } from '../validators/review.validator'

const router = Router()

router.post('/booking/:bookingId',       authenticate, validate(createReviewSchema), reviewController.create)
router.post('/booking/:bookingId/reply', authenticate, validate(mentorReplySchema),  reviewController.addMentorReply)

export default router