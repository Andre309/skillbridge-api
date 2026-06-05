import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, authLimiter } from '../middleware'
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login',    authLimiter, validate(loginSchema),    authController.login)
router.post('/refresh',  validate(refreshSchema),               authController.refresh)
router.post('/logout',   authenticate,                          authController.logout)
router.get('/me',        authenticate,                          authController.me)

export default router
