import { prisma } from '../utils/prisma'
import { AppError } from '../utils/response'
import { CreateReviewDto, MentorReplyDto } from '../validators/review.validator'

export class ReviewService {
  async create(bookingId: string, reviewerId: string, dto: CreateReviewDto) {
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { mentor: true },
    })
    if (!booking) throw new AppError(404, 'Бронювання не знайдено')
    if (booking.status !== 'completed') throw new AppError(400, 'Сесія ще не завершена')
    if (booking.menteeId !== reviewerId) throw new AppError(403, 'Тільки менті може залишати відгук')

    const existing = await prisma.review.findUnique({ where: { bookingId } })
    if (existing) throw new AppError(409, 'Відгук вже залишено')

    return prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        revieweeId: booking.mentor.userId,
        rating:     dto.rating,
        comment:    dto.comment,
      },
    })
  }

  async addMentorReply(bookingId: string, mentorUserId: string, dto: MentorReplyDto) {
    const review = await prisma.review.findUnique({
      where:   { bookingId },
      include: { booking: { include: { mentor: true } } },
    })
    if (!review) throw new AppError(404, 'Відгук не знайдено')
    if (review.booking.mentor.userId !== mentorUserId) throw new AppError(403, 'Доступ заборонено')
    if (review.mentorReply) throw new AppError(409, 'Відповідь вже додана')

    return prisma.review.update({
      where: { bookingId },
      data:  { mentorReply: dto.reply, mentorReplyAt: new Date() },
    })
  }
}

export const reviewService = new ReviewService()