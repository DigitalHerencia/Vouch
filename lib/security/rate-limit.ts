import "server-only"

import type { RateLimitResult } from "@/types/security"

type RateLimitBucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitBucket>()

function checkRateLimit(name: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const current = buckets.get(name)

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(name, { count: 1, resetAt })
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: new Date(resetAt),
    }
  }

  current.count += 1

  return {
    allowed: current.count <= limit,
    limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: new Date(current.resetAt),
  }
}

export async function rateLimitWebhook(): Promise<RateLimitResult> {
  return checkRateLimit("webhook", 300, 60_000)
}

export async function rateLimitAuthAction(): Promise<RateLimitResult> {
  return checkRateLimit("auth-action", 20, 60_000)
}

export async function rateLimitSensitiveAction(): Promise<RateLimitResult> {
  return checkRateLimit("sensitive-action", 10, 60_000)
}
