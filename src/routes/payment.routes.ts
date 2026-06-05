import { Router, raw } from 'express'
import { stripeService } from '../services/stripe.service'
import { authenticate, requireRole } from '../middleware'
import { ok, created } from '../utils/response'

const router = Router()

// Звичайні JSON роути
router.post('/booking/:bookingId/payment-intent', authenticate, async (req, res, next) => {
  try {
    const bookingId = req.params['bookingId'] as string
    const result = await stripeService.createPaymentIntent(bookingId)
    created(res, result)
  } catch (e) { next(e) }
})

router.post('/connect/onboard', authenticate, requireRole('mentor','both','admin'), async (req, res, next) => {
  try {
    const result = await stripeService.createConnectAccount(req.user!.sub)
    ok(res, result)
  } catch (e) { next(e) }
})

// Stripe Webhook — raw body потрібен для верифікації підпису
router.post('/webhook', raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'] as string
    await stripeService.handleWebhook(req.body as Buffer, sig)
    res.json({ received: true })
  } catch (e) { next(e) }
})

export default router