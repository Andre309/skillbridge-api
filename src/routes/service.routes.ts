import { Router } from 'express'
import { serviceController } from '../controllers/service.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, requireRole } from '../middleware'
import { serviceSchema } from '../validators/service.validator'

const router = Router()

// Public
router.get('/mentor/:mentorId', serviceController.getByMentor)

// Protected
router.post('/',       authenticate, requireRole('mentor','both','admin'), validate(serviceSchema), serviceController.create)
router.put('/:id',     authenticate, requireRole('mentor','both','admin'), validate(serviceSchema), serviceController.update)
router.delete('/:id',  authenticate, requireRole('mentor','both','admin'), serviceController.delete)

export default router