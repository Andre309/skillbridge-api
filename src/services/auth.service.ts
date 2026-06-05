import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt'
import { AppError } from '../utils/response'
import { RegisterDto, LoginDto } from '../validators/auth.validator'
import { config } from '../config'

const REFRESH_KEY = (userId: string) => `refresh:${userId}`

export class AuthService {
  async register(dto: RegisterDto) {
    const exists = await prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new AppError(409, 'Email вже зареєстровано', 'EMAIL_TAKEN')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName:    dto.fullName,
        displayName: dto.displayName,
        timezone:    dto.timezone,
        locale:      dto.locale,
        role:        dto.role as any,
        ...(dto.role !== 'mentee' && {
          mentorProfile: { create: {} },
        }),
      },
      select: { id: true, email: true, fullName: true, role: true },
    })

    const tokens = await this.issueTokens(user.id, user.role)
    return { user, ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where:  { email: dto.email },
      select: { id: true, email: true, fullName: true, role: true, passwordHash: true, isBanned: true, isActive: true },
    })
    if (!user?.passwordHash) throw new AppError(401, 'Невірний email або пароль', 'INVALID_CREDENTIALS')
    if (user.isBanned)  throw new AppError(403, 'Акаунт заблоковано', 'BANNED')
    if (!user.isActive) throw new AppError(403, 'Акаунт деактивовано', 'INACTIVE')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Невірний email або пароль', 'INVALID_CREDENTIALS')

    await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })

    const { passwordHash: _, ...safeUser } = user
    const tokens = await this.issueTokens(user.id, user.role)
    return { user: safeUser, ...tokens }
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; role: string }
    try {
      payload = verifyRefresh(refreshToken)
    } catch {
      throw new AppError(401, 'Невалідний refresh token', 'INVALID_TOKEN')
    }

    const stored = await redis.get(REFRESH_KEY(payload.sub))
    if (stored !== refreshToken) throw new AppError(401, 'Refresh token не знайдено', 'TOKEN_REUSE')

    const user = await prisma.user.findUnique({
      where:  { id: payload.sub },
      select: { id: true, role: true, isBanned: true },
    })
    if (!user || user.isBanned) throw new AppError(401, 'Користувача не знайдено', 'UNAUTHORIZED')

    return this.issueTokens(user.id, user.role)
  }

  async logout(userId: string, accessToken: string) {
    // Block the access token
    await redis.set(`blocklist:${accessToken}`, '1', 'EX', 60 * 16) // 16 хв
    await redis.del(REFRESH_KEY(userId))
  }

  async oauthUpsert(provider: string, providerUid: string, profile: {
    email: string; fullName: string; avatarUrl?: string
  }) {
    let oauth = await prisma.oAuthAccount.findUnique({
      where:   { provider_providerUid: { provider, providerUid } },
      include: { user: { select: { id: true, role: true, isBanned: true } } },
    })

    if (!oauth) {
      let user = await prisma.user.findUnique({ where: { email: profile.email } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email:     profile.email,
            fullName:  profile.fullName,
            avatarUrl: profile.avatarUrl,
            emailVerified: true,
          },
        })
      }
      oauth = await prisma.oAuthAccount.create({
        data:    { userId: user.id, provider, providerUid },
        include: { user: { select: { id: true, role: true, isBanned: true } } },
      })
    }

    if (oauth.user.isBanned) throw new AppError(403, 'Акаунт заблоковано', 'BANNED')
    return this.issueTokens(oauth.user.id, oauth.user.role)
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken  = signAccess({ sub: userId, role })
    const refreshToken = signRefresh({ sub: userId, role })

    // Store refresh in Redis with 30-day TTL
    await redis.set(REFRESH_KEY(userId), refreshToken, 'EX', 60 * 60 * 24 * 30)
    return { accessToken, refreshToken }
  }
}

export const authService = new AuthService()
