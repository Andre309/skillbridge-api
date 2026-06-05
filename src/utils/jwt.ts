import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface JwtPayload {
  sub: string   // user id
  role: string
  iat?: number
  exp?: number
}

export const signAccess = (payload: Omit<JwtPayload, 'iat' | 'exp'>) =>
  jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_ACCESS_EXPIRES as any })

export const signRefresh = (payload: Omit<JwtPayload, 'iat' | 'exp'>) =>
  jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES as any })

export const verifyAccess = (token: string) =>
  jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload

export const verifyRefresh = (token: string) =>
  jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload
