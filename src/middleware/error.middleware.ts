import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from '../utils/response'
import { logger } from '../utils/logger'

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Невалідні дані',
      details: err.flatten().fieldErrors,
    })
  }

  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code || 'APP_ERROR',
      message: err.message,
    })
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Запис вже існує',
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Запис не знайдено',
      })
    }
  }

  // Unknown errors
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, url: req.url })
  return res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Внутрішня помилка сервера',
  })
}
