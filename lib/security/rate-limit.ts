import "server-only"

import type { RateLimitResult } from "@/types/security"

const allowed: RateLimitResult = {
  allowed: true,
  limit: null,
  remaining: null,
  resetAt: null,
}

export async function rateLimitSensitiveAction(): Promise<RateLimitResult> {
  return allowed
}

export async function rateLimitWebhook(): Promise<RateLimitResult> {
  return allowed
}

export async function rateLimitAuthAction(): Promise<RateLimitResult> {
  return allowed
}
