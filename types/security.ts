export type HeaderBag = {
  get(name: string): string | null
}

export type RequestMetadataInput = {
  headers?: HeaderBag
}

export type RateLimitResult = {
  allowed: boolean
  limit: number | null
  remaining: number | null
  resetAt: Date | null
}

export type IdempotencyKeyParts = {
  actorId?: string | null
  action: string
  resourceId?: string | null
  requestId?: string | null
  payloadHash?: string | null
}
