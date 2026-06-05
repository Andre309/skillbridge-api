import { prisma } from '../utils/prisma'
import { AppError } from '../utils/response'
import { MentorProfileDto, MentorSearchDto } from '../validators/mentor.validator'

// Витягуємо типи напряму з Prisma Client — не залежимо від prisma generate namespace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MentorWhereInput   = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MentorOrderByInput = Record<string, any>

export class MentorService {
  async getProfile(userId: string) {
    const profile = await prisma.mentorProfile.findUnique({
      where:   { userId },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true, timezone: true, bio: true } } },
    })
    if (!profile) throw new AppError(404, 'Профіль ментора не знайдено')
    return profile
  }

  async updateProfile(userId: string, dto: MentorProfileDto) {
    const profile = await prisma.mentorProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Профіль ментора не знайдено')

    return prisma.mentorProfile.update({
      where: { userId },
      data:  dto as Parameters<typeof prisma.mentorProfile.update>[0]['data'],
    })
  }

  async search(dto: MentorSearchDto) {
    const { q, category, minPrice, maxPrice, lang, rating, featured, page, limit, sort } = dto
    const skip = (page - 1) * limit

    const where: MentorWhereInput = {
      user: { isActive: true, isBanned: false },
      ...(featured !== undefined && { isFeatured: featured }),
      ...(rating   !== undefined && { avgRating: { gte: rating } }),
      ...(lang     !== undefined && { languages: { has: lang } }),
      ...(q !== undefined && {
        OR: [
          { headline: { contains: q, mode: 'insensitive' } },
          { company:  { contains: q, mode: 'insensitive' } },
          { user: { fullName: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(category !== undefined && {
        services: { some: { isActive: true, category: { slug: category } } },
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        services: {
          some: {
            isActive: true,
            priceCents: {
              ...(minPrice !== undefined && { gte: Math.round(minPrice * 100) }),
              ...(maxPrice !== undefined && { lte: Math.round(maxPrice * 100) }),
            },
          },
        },
      }),
    }

    const orderBy: MentorOrderByInput =
      sort === 'rating'   ? { avgRating: 'desc' }     :
      sort === 'sessions' ? { totalSessions: 'desc' } :
      { avgRating: 'desc' }

    const [total, items] = await Promise.all([
      prisma.mentorProfile.count({ where }),
      prisma.mentorProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user:     { select: { id: true, fullName: true, avatarUrl: true, timezone: true } },
          services: {
            where:   { isActive: true },
            orderBy: { priceCents: 'asc' },
            take:    3,
            select:  { id: true, title: true, priceCents: true, durationMinutes: true, currency: true, tags: true },
          },
        },
      }),
    ])

    return { items, total, page, limit }
  }

  async getPublicProfile(mentorProfileId: string) {
    const mentor = await prisma.mentorProfile.findUnique({
      where:   { id: mentorProfileId },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, bio: true, timezone: true } },
        services: {
          where:   { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { priceCents: 'asc' }],
        },
      },
    })
    if (!mentor) throw new AppError(404, 'Ментора не знайдено')
    return mentor
  }

  async getReviews(mentorProfileId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentorProfileId } })
    if (!mentor) throw new AppError(404, 'Ментора не знайдено')

    const [total, items] = await Promise.all([
      prisma.review.count({
        where: { booking: { mentorId: mentorProfileId }, isPublic: true },
      }),
      prisma.review.findMany({
        where:   { booking: { mentorId: mentorProfileId }, isPublic: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { reviewer: { select: { fullName: true, avatarUrl: true } } },
      }),
    ])

    return { items, total, page, limit }
  }
}

export const mentorService = new MentorService()
