interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter helper
 * @param key Unique key e.g. "ip:auth:login"
 * @param maxHits Maximum attempts allowed in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, maxHits: number = 10, windowMs: number = 60 * 1000): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxHits - 1 };
  }

  if (record.count >= maxHits) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: maxHits - record.count };
}
