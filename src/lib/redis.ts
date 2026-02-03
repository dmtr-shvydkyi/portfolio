import { createClient, type RedisClientType } from 'redis';

declare global {
  var __snakeRedisClient: RedisClientType | undefined;
}

const getRedisUrl = () =>
  process.env.REDIS_URL ??
  process.env.REDIS_TLS_URL ??
  process.env.VERCEL_REDIS_URL ??
  process.env.VERCEL_REDIS_TLS_URL ??
  '';

export const getRedis = async () => {
  const url = getRedisUrl();
  if (!url) {
    throw new Error('Missing Redis URL environment variable.');
  }

  if (!globalThis.__snakeRedisClient) {
    globalThis.__snakeRedisClient = createClient({ url });
    globalThis.__snakeRedisClient.on('error', err => {
      console.error('Redis Client Error', err);
    });
  }

  if (!globalThis.__snakeRedisClient.isOpen) {
    await globalThis.__snakeRedisClient.connect();
  }

  return globalThis.__snakeRedisClient;
};
