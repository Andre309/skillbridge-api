import { prisma } from '../utils/prisma'
import { AppError } from '../utils/response'
import { ServiceDto } from '../validators/service.validator'

export class ServiceService {
  async getByMentor(mentorId: string) {
    return prisma.service.findMany({
      where:   { mentorId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { category: true },
    })
  }

  async create(userId: string, dto: ServiceDto) {
    const mentor = await prisma.mentorProfile.findUnique({ where: { userId } })
    if (!mentor) throw new AppError(404, 'Профіль ментора не знайдено')

    // Pro: необмежено; Starter: max 5 послуг
    if (mentor.subscriptionPlan === 'starter') {
      const count = await prisma.service.count({ where: { mentorId: mentor.id, isActive: true } })
      if (count >= 5) throw new AppError(403, 'Ліміт послуг для Starter-плану (5). Перейди на Pro')
    }

    return prisma.service.create({ data: { mentorId: mentor.id, ...dto } })
  }

  async update(serviceId: string, userId: string, dto: Partial<ServiceDto>) {
    const service = await prisma.service.findUnique({
      where:   { id: serviceId },
      include: { mentor: true },
    })
    if (!service) throw new AppError(404, 'Сервіс не знайдено')
    if (service.mentor.userId !== userId) throw new AppError(403, 'Доступ заборонено')

    return prisma.service.update({ where: { id: serviceId }, data: dto as any })
  }

  async delete(serviceId: string, userId: string) {
    const service = await prisma.service.findUnique({
      where:   { id: serviceId },
      include: { mentor: true },
    })
    if (!service) throw new AppError(404, 'Сервіс не знайдено')
    if (service.mentor.userId !== userId) throw new AppError(403, 'Доступ заборонено')

    // Soft delete
    return prisma.service.update({ where: { id: serviceId }, data: { isActive: false } })
  }
}

export const serviceService = new ServiceService()
