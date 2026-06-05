import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createPresentationRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });
}

export const presentationRatelimit = createPresentationRatelimit();
