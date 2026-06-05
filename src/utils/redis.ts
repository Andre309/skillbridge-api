import IORedis from 'ioredis'
import { config } from '../config'
import { logger } from './logger'

export const redis = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
})

redis.on('connect', () => logger.info('✅ Redis connected'))
redis.on('error',   (err) => logger.error('Redis error', err))

export default redis
