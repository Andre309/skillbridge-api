import { Request, Response, NextFunction } from 'express'
import { verifyAccess, JwtPayload } from '../utils/jwt'
import { AppError } from '../utils/response'
import { redis } from '../utils/redis'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

const extractToken = (req: Request): string | null => {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  if (req.cookies?.access_token) return req.cookies.access_token
  return null
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req)
    if (!token) throw new AppError(401, 'Токен відсутній', 'UNAUTHORIZED')

    // Check blocklist (logout tokens)
    const blocked = await redis.get(`blocklist:${token}`)
    if (blocked) throw new AppError(401, 'Токен відкликано', 'TOKEN_REVOKED')

    const payload = verifyAccess(token)
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof AppError) return next(err)
    next(new AppError(401, 'Невалідний або прострочений токен', 'INVALID_TOKEN'))
  }
}

export const requireRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Не авторизовано', 'UNAUTHORIZED'))
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Недостатньо прав', 'FORBIDDEN'))
    }
    next()
  }

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (!token) return next()
  try {
    req.user = verifyAccess(token)
  } catch (_) { /* silent */ }
  next()
}
