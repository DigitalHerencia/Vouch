import { createHash } from "node:crypto"

import type { IdempotencyKeyParts } from "@/types/security"

const IDEMPOTENCY_KEY_PATTERN = /^[a-z0-9][a-z0-9:_-]{15,191}$/

function normalizeKeyPart(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) return fallback

  return normalized.replace(/[^a-z0-9:_-]+/g, "-").replace(/^-+|-+$/g, "") || fallback
}

export function createIdempotencyKey(parts: IdempotencyKeyParts): string {
  const action = normalizeKeyPart(parts.action, "action")
  const actorId = normalizeKeyPart(parts.actorId, "anonymous")
  const resourceId = normalizeKeyPart(parts.resourceId, "global")
  const requestId = normalizeKeyPart(parts.requestId, "request")
  const payloadHash = normalizeKeyPart(parts.payloadHash, "payload")

  const digest = createHash("sha256")
    .update(action)
    .update("\0")
    .update(actorId)
    .update("\0")
    .update(resourceId)
    .update("\0")
    .update(requestId)
    .update("\0")
    .update(payloadHash)
    .digest("hex")
    .slice(0, 32)

  return `${action}:${digest}`
}

export function assertIdempotencyKey(key: string): void {
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new Error("Invalid idempotency key.")
  }
}
