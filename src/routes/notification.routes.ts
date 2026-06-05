import { Router } from 'express'
import { authenticate } from '../middleware'
import { ok, noContent } from '../utils/response'
import prisma from '../utils/prisma'

const router = Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await prisma.notification.findMany({
      where:   { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })
    ok(res, items)
  } catch (e) { next(e) }
})

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.sub },
      data:  { readAt: new Date() },
    })
    noContent(res)
  } catch (e) { next(e) }
})

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, readAt: null },
      data:  { readAt: new Date() },
    })
    noContent(res)
  } catch (e) { next(e) }
})

export default router