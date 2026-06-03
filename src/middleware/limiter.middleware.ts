import { logger } from "../utils/logger";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const memoryStore = new Map<string, number[]>();

export async function isRateLimited(key: string, limitConfig: RateLimitConfig): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - limitConfig.windowMs;

  let requests = memoryStore.get(key) || [];

  // Filter out expired request timestamps
  requests = requests.filter((timestamp) => timestamp > windowStart);

  if (requests.length >= limitConfig.max) {
    logger.warn(`Rate limit exceeded for client: ${key}`, {
      count: requests.length,
      max: limitConfig.max,
    });
    return true;
  }

  // Add current timestamp
  requests.push(now);
  memoryStore.set(key, requests);

  // Clean memory store occasionally (basic garbage collection helper)
  if (memoryStore.size > 1000) {
    for (const [storeKey, timestamps] of memoryStore.entries()) {
      const activeTimestamps = timestamps.filter((t) => t > windowStart);
      if (activeTimestamps.length === 0) {
        memoryStore.delete(storeKey);
      } else {
        memoryStore.set(storeKey, activeTimestamps);
      }
    }
  }

  return false;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
