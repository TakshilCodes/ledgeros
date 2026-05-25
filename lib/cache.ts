import redis from "@/lib/redis";

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);

    if (!cached) return null;

    return JSON.parse(cached) as T;
  } catch (error) {
    console.error("Redis get cache error:", error);
    return null;
  }
}

export async function setCache<T>({
  key,
  value,
  ttlSeconds,
}: {
  key: string;
  value: T;
  ttlSeconds: number;
}) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("Redis set cache error:", error);
  }
}

export async function deleteCacheByPattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return;

    await redis.del(...keys);
  } catch (error) {
    console.error("Redis delete cache error:", error);
  }
}