import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { ok, created } from '../utils/response'
import { RegisterDto, LoginDto, RefreshDto } from '../validators/auth.validator'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body as RegisterDto)
      created(res, result)
    } catch (e) { next(e) }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body as LoginDto)
      ok(res, result)
    } catch (e) { next(e) }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshDto
      const tokens = await authService.refresh(refreshToken)
      ok(res, tokens)
    } catch (e) { next(e) }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.slice(7) || ''
      await authService.logout(req.user!.sub, token)
      res.status(204).send()
    } catch (e) { next(e) }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { prisma } = await import('../utils/prisma')
      const user = await prisma.user.findUnique({
        where:   { id: req.user!.sub },
        select:  {
          id: true, email: true, fullName: true, displayName: true,
          avatarUrl: true, role: true, timezone: true, locale: true,
          bio: true, emailVerified: true, createdAt: true,
          mentorProfile: { select: { id: true, subscriptionPlan: true, isVerified: true } },
        },
      })
      ok(res, user)
    } catch (e) { next(e) }
  },
}
