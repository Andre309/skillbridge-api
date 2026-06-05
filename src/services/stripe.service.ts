import StripeClient from 'stripe'
import type { Stripe } from 'stripe'
import { config } from '../config'
import { prisma } from '../utils/prisma'
import { AppError } from '../utils/response'
import { logger } from '../utils/logger'

// Локальні типи — не залежать від версії Stripe SDK namespace
type StripeEvent = {
  type: string
  data: { object: Record<string, unknown> }
}

type StripePaymentIntent = {
  id: string
  metadata: Record<string, string>
  last_payment_error?: { message?: string }
}

type StripeAccount = {
  id: string
  details_submitted: boolean
}

// Stripe v22: клас імпортується як named export { Stripe }
// Версія API береться зі встановленого пакету — не треба вказувати вручну
const stripe = config.STRIPE_SECRET_KEY
  ? new StripeClient(config.STRIPE_SECRET_KEY)
  : null

export class StripeService {
  private ensureStripe(): Stripe {
    if (!stripe) throw new AppError(503, 'Платіжний сервіс недоступний')
    return stripe
  }

  // Створення PaymentIntent для бронювання
  async createPaymentIntent(bookingId: string) {
    const s = this.ensureStripe()
    const booking = await prisma.booking.findUnique({
      where:   { id: bookingId },
      include: { mentee: true, mentor: { include: { user: true } } },
    })
    if (!booking) throw new AppError(404, 'Бронювання не знайдено')
    if (booking.status !== 'pending') throw new AppError(400, 'Бронювання не в стані pending')

    const intent = await s.paymentIntents.create({
      amount:   booking.priceCents,
      currency: booking.currency.toLowerCase(),
      metadata: { bookingId, menteeId: booking.menteeId, mentorId: booking.mentorId },
      ...(booking.mentor.stripeAccountId && {
        transfer_data:          { destination: booking.mentor.stripeAccountId },
        application_fee_amount: booking.platformFeeCents,
      }),
    })

    await prisma.transaction.create({
      data: {
        bookingId,
        userId:          booking.menteeId,
        type:            'booking_payment',
        status:          'pending',
        amountCents:     booking.priceCents,
        currency:        booking.currency,
        stripePaymentId: intent.id,
        description:     `Оплата сесії #${bookingId.slice(0, 8)}`,
      },
    })

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id }
  }

  // Обробка Stripe Webhook
  async handleWebhook(rawBody: Buffer, signature: string) {
    const s = this.ensureStripe()
    if (!config.STRIPE_WEBHOOK_SECRET) throw new AppError(503, 'Webhook secret не налаштовано')

    let event: StripeEvent
    try {
      event = s.webhooks.constructEvent(
        rawBody,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      ) as unknown as StripeEvent
    } catch {
      throw new AppError(400, 'Невалідний webhook signature')
    }

    logger.info(`Stripe webhook: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as StripePaymentIntent
        const bookingId = pi.metadata['bookingId']
        if (!bookingId) break

        await prisma.$transaction([
          prisma.booking.update({
            where: { id: bookingId },
            data:  { status: 'confirmed' },
          }),
          prisma.transaction.updateMany({
            where: { stripePaymentId: pi.id },
            data:  { status: 'succeeded' },
          }),
        ])
        logger.info(`Booking ${bookingId} confirmed via Stripe`)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as StripePaymentIntent
        await prisma.transaction.updateMany({
          where: { stripePaymentId: pi.id },
          data:  { status: 'failed', failedReason: pi.last_payment_error?.message },
        })
        break
      }

      case 'account.updated': {
        const account = event.data.object as StripeAccount
        if (account.details_submitted) {
          await prisma.mentorProfile.updateMany({
            where: { stripeAccountId: account.id },
            data:  { isVerified: true },
          })
        }
        break
      }
    }
  }

  // Stripe Connect Onboarding для менторів
  async createConnectAccount(userId: string) {
    const s = this.ensureStripe()
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError(404, 'Користувача не знайдено')

    const account = await s.accounts.create({
      type:     'express',
      email:    user.email,
      metadata: { userId },
    })

    await prisma.mentorProfile.update({
      where: { userId },
      data:  { stripeAccountId: account.id },
    })

    const link = await s.accountLinks.create({
      account:     account.id,
      refresh_url: `${config.FRONTEND_URL}/mentor/payments?stripe=refresh`,
      return_url:  `${config.FRONTEND_URL}/mentor/payments?stripe=success`,
      type:        'account_onboarding',
    })

    return { url: link.url }
  }
}

export const stripeService = new StripeService()
