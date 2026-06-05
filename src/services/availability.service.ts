import { prisma } from '../utils/prisma'
import { AppError } from '../utils/response'
import { AvailabilityTemplateDto, AvailabilityOverrideDto, SlotsQueryDto } from '../validators/availability.validator'
import dayjs from 'dayjs'

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const

export class AvailabilityService {
  async getTemplates(mentorId: string) {
    return prisma.availabilityTemplate.findMany({
      where:   { mentorId, isActive: true },
      orderBy: { day: 'asc' },
    })
  }

  async upsertTemplate(mentorId: string, dto: AvailabilityTemplateDto) {
    return prisma.availabilityTemplate.upsert({
      where:  { mentorId_day_startTime: { mentorId, day: dto.day, startTime: dto.startTime } },
      create: { mentorId, ...dto },
      update: { endTime: dto.endTime, isActive: dto.isActive },
    })
  }

  async deleteTemplate(mentorId: string, templateId: string) {
    const tpl = await prisma.availabilityTemplate.findFirst({ where: { id: templateId, mentorId } })
    if (!tpl) throw new AppError(404, 'Шаблон не знайдено')
    await prisma.availabilityTemplate.delete({ where: { id: templateId } })
  }

  async addOverride(mentorId: string, dto: AvailabilityOverrideDto) {
    return prisma.availabilityOverride.create({
      data: { mentorId, date: new Date(dto.date), startTime: dto.startTime, endTime: dto.endTime, reason: dto.reason },
    })
  }

  async getOverrides(mentorId: string, from: string, to: string) {
    return prisma.availabilityOverride.findMany({
      where: {
        mentorId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { date: 'asc' },
    })
  }

  // Повертає вільні слоти ментора на конкретний день
  async getSlots(dto: SlotsQueryDto) {
    const service = await prisma.service.findUnique({
      where:   { id: dto.serviceId, isActive: true },
      include: { mentor: true },
    })
    if (!service) throw new AppError(404, 'Сервіс не знайдено')

    const date     = dayjs(dto.date)
    const dayName  = DAYS[date.day()]
    const duration = service.durationMinutes

    // Шаблон доступності для цього дня
    const template = await prisma.availabilityTemplate.findFirst({
      where: { mentorId: service.mentorId, day: dayName, isActive: true },
    })
    if (!template) return []

    // Перевіряємо overrides
    const override = await prisma.availabilityOverride.findFirst({
      where: { mentorId: service.mentorId, date: date.toDate() },
    })
    if (override && !override.startTime) return [] // весь день заблоковано

    // Вже зайняті слоти
    const startOfDay = date.startOf('day').toDate()
    const endOfDay   = date.endOf('day').toDate()
    const booked: { scheduledAt: Date; durationMinutes: number }[] = await prisma.booking.findMany({
      where: {
        mentorId:    service.mentorId,
        status:      { in: ['confirmed', 'in_progress'] },
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { scheduledAt: true, durationMinutes: true },
    })

    // Генерація слотів з кроком duration хвилин
    const slots: string[] = []
    let current = dayjs(`${dto.date} ${template.startTime}`)
    const end   = dayjs(`${dto.date} ${template.endTime}`)

    while (current.add(duration, 'minute').isBefore(end) || current.add(duration, 'minute').isSame(end)) {
      const slotEnd = current.add(duration, 'minute')
      const isBusy  = booked.some(b => {
        const bs = dayjs(b.scheduledAt)
        const be = bs.add(b.durationMinutes, 'minute')
        return current.isBefore(be) && slotEnd.isAfter(bs)
      })

      if (!isBusy && current.isAfter(dayjs())) {
        slots.push(current.toISOString())
      }
      current = current.add(duration, 'minute')
    }

    return slots
  }
}

export const availabilityService = new AvailabilityService()
