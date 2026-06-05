import { Router } from 'express'
import { ok } from '../utils/response'
import prisma from '../utils/prisma'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      where:   { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
    ok(res, cats)
  } catch (e) { next(e) }
})

export default router