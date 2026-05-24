import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export default redis;