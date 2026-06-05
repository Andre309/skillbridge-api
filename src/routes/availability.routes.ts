import { Router } from 'express'
import { availabilityController } from '../controllers/availability.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, requireRole } from '../middleware'
import { availabilityTemplateSchema, availabilityOverrideSchema, slotsQuerySchema } from '../validators/availability.validator'

const router = Router()

// Public — вільні слоти
router.get('/slots', validate(slotsQuerySchema, 'query'), availabilityController.getSlots)

// Protected — тільки ментори
const mentorAuth = [authenticate, requireRole('mentor','both','admin')]
router.get('/templates',       ...mentorAuth, availabilityController.getTemplates)
router.post('/templates',      ...mentorAuth, validate(availabilityTemplateSchema), availabilityController.upsertTemplate)
router.delete('/templates/:id',...mentorAuth, availabilityController.deleteTemplate)
router.get('/overrides',       ...mentorAuth, availabilityController.getOverrides)
router.post('/overrides',      ...mentorAuth, validate(availabilityOverrideSchema), availabilityController.addOverride)

export default router