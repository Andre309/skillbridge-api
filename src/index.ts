import 'dotenv/config'
import app from './app'
import { config } from './config'
import { logger } from './utils/logger'
import { prisma } from './utils/prisma'
import { redis } from './utils/redis'

const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`)
  await Promise.all([prisma.$disconnect(), redis.quit()])
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
  process.exit(1)
})

const start = async () => {
  await redis.connect()
  await prisma.$connect()
  logger.info('✅ Database connected')

  app.listen(config.PORT, () => {
    logger.info(`🚀 SkillBridge API running on port ${config.PORT} [${config.NODE_ENV}]`)
    logger.info(`   Prefix: ${config.API_PREFIX}`)
  })
}

start().catch((err) => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})