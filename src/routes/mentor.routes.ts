import { Router } from 'express'
import { mentorController } from '../controllers/mentor.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, requireRole } from '../middleware'
import { mentorProfileSchema, mentorSearchSchema } from '../validators/mentor.validator'

const router = Router()

// Public
router.get('/',       validate(mentorSearchSchema, 'query'), mentorController.search)
router.get('/:id',                                           mentorController.getPublicProfile)
router.get('/:id/reviews',                                   mentorController.getReviews)

// Protected — only mentors
router.get('/me/profile',   authenticate, requireRole('mentor','both','admin'), mentorController.getMyProfile)
router.put('/me/profile',   authenticate, requireRole('mentor','both','admin'),
           validate(mentorProfileSchema), mentorController.updateMyProfile)

export default router
