import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'
import { AppError } from '../utils/response'
import { CreateBookingDto, CancelBookingDto, BookingQueryDto } from '../validators/booking.validator'
import { config } from '../config'
import dayjs from 'dayjs'

const LOCK_KEY = (mentorId: string, slot: string) => `slot_lock:${mentorId}:${slot}`

export class BookingService {
  async create(menteeId: string, dto: CreateBookingDto) {
    const service = await prisma.service.findUnique({
      where:   { id: dto.serviceId, isActive: true },
      include: { mentor: { include: { user: true } } },
    })
    if (!service) throw new AppError(404, 'Сервіс не знайдено або неактивний')

    const mentorUserId = service.mentor.userId
    if (menteeId === mentorUserId) throw new AppError(400, 'Не можна бронювати власну сесію')

    const scheduledAt = new Date(dto.scheduledAt)
    if (scheduledAt <= new Date()) throw new AppError(400, 'Час у минулому')

    // Distributed lock — запобігаємо race condition
    const lockKey = LOCK_KEY(service.mentorId, dto.scheduledAt)
    const locked  = await redis.set(lockKey, '1', 'EX', 30, 'NX')
    if (!locked) throw new AppError(409, 'Цей слот щойно зайнятий, обери інший')

    try {
      // Перевірка конфліктів
      const slotEnd = dayjs(scheduledAt).add(service.durationMinutes, 'minute').toDate()
      const conflict = await prisma.booking.findFirst({
        where: {
          mentorId: service.mentorId,
          status:   { in: ['confirmed', 'in_progress'] },
          scheduledAt: { lt: slotEnd },
          AND: [{
            scheduledAt: {
              gte: dayjs(scheduledAt).subtract(service.durationMinutes, 'minute').toDate(),
            },
          }],
        },
      })
      if (conflict) throw new AppError(409, 'Цей слот вже зайнятий')

      // Розрахунок комісії
      const feePct            = config.STRIPE_PLATFORM_FEE_PCT
      const platformFeeCents  = Math.round(service.priceCents * feePct / 100)
      const mentorPayoutCents = service.priceCents - platformFeeCents

      // Промокод
      let discount = 0
      if (dto.promoCode) {
        const promo = await prisma.promoCode.findFirst({
          where: {
            code:     dto.promoCode,
            isActive: true,
            validFrom: { lte: new Date() },
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          },
        })
        if (!promo) throw new AppError(400, 'Невалідний промокод')
        if (promo.maxUses && promo.usedCount >= promo.maxUses)
          throw new AppError(400, 'Промокод вичерпано')

        discount = promo.discountPct
          ? Math.round(service.priceCents * Number(promo.discountPct) / 100)
          : (promo.discountCents ?? 0)
      }

      const finalPrice = Math.max(0, service.priceCents - discount)

      const booking = await prisma.booking.create({
        data: {
          serviceId:         service.id,
          mentorId:          service.mentorId,
          menteeId,
          scheduledAt,
          durationMinutes:   service.durationMinutes,
          priceCents:        finalPrice,
          currency:          service.currency,
          platformFeePct:    feePct,
          platformFeeCents,
          mentorPayoutCents,
          notes:             dto.notes,
          status:            finalPrice === 0 ? 'confirmed' : 'pending',
        },
        include: {
          service: { select: { title: true } },
          mentor:  { include: { user: { select: { fullName: true, email: true } } } },
          mentee:  { select: { fullName: true, email: true } },
        },
      })

      return booking
    } finally {
      await redis.del(lockKey)
    }
  }

  async getMyBookings(userId: string, role: 'mentee' | 'mentor', dto: BookingQueryDto) {
    const skip = (dto.page - 1) * dto.limit
    const where: any = {
      ...(role === 'mentee' ? { menteeId: userId } : {}),
      ...(role === 'mentor' ? {
        mentor: { userId },
      } : {}),
      ...(dto.status && { status: dto.status }),
      ...(dto.from   && { scheduledAt: { gte: new Date(dto.from) } }),
      ...(dto.to     && { scheduledAt: { lte: new Date(dto.to) } }),
    }

    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: dto.limit,
        include: {
          service: { select: { title: true, durationMinutes: true } },
          mentor:  { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          mentee:  { select: { id: true, fullName: true, avatarUrl: true } },
          review:  { select: { rating: true } },
        },
      }),
    ])

    return { items, total, page: dto.page, limit: dto.limit }
  }

  async getById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: {
        service: true,
        mentor:  { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
        mentee:  { select: { id: true, fullName: true, avatarUrl: true } },
        review:  true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
      },
    })
    if (!booking) throw new AppError(404, 'Бронювання не знайдено')

    const isParticipant = booking.menteeId === userId || booking.mentor.userId === userId
    if (!isParticipant) throw new AppError(403, 'Доступ заборонено')

    return booking
  }

  async cancel(bookingId: string, userId: string, dto: CancelBookingDto) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new AppError(404, 'Бронювання не знайдено')
    if (!['pending', 'confirmed'].includes(booking.status))
      throw new AppError(400, 'Бронювання не може бути скасовано')

    const mentor = await prisma.mentorProfile.findUnique({ where: { id: booking.mentorId } })
    const isParticipant = booking.menteeId === userId || mentor?.userId === userId
    if (!isParticipant) throw new AppError(403, 'Доступ заборонено')

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status:             'cancelled',
        cancellationReason: dto.reason,
        cancelledBy:        userId,
        cancelledAt:        new Date(),
      },
    })
  }

  async complete(bookingId: string, mentorUserId: string) {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { mentor: true },
    })
    if (!booking) throw new AppError(404, 'Бронювання не знайдено')
    if (booking.mentor.userId !== mentorUserId) throw new AppError(403, 'Доступ заборонено')
    if (booking.status !== 'in_progress') throw new AppError(400, 'Сесія не в процесі')

    return prisma.booking.update({
      where: { id: bookingId },
      data:  { status: 'completed', endedAt: new Date() },
    })
  }
}

export const bookingService = new BookingService()
