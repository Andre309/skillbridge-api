import { Response } from 'express'

export const ok = (res: Response, data: unknown, meta?: Record<string, unknown>) =>
  res.json({ success: true, data, ...(meta ? { meta } : {}) })

export const created = (res: Response, data: unknown) =>
  res.status(201).json({ success: true, data })

export const noContent = (res: Response) => res.status(204).send()

export const paginate = (
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) =>
  res.json({
    success: true,
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const notFound = (entity = 'Ресурс') =>
  new AppError(404, `${entity} не знайдено`)

export const forbidden = (msg = 'Доступ заборонено') =>
  new AppError(403, msg)

export const badRequest = (msg: string) => new AppError(400, msg)
