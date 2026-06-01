// lib/security/hash.ts

import "server-only"

import { createHash } from "node:crypto"

const HASH_ALGORITHM = "sha256"

function normalizeHashInput(value: string): string {
  return value.trim()
}

export async function hashSensitiveValue(value: string): Promise<string> {
  const normalized = normalizeHashInput(value)
  if (!normalized) {
    throw new Error("HASH_INPUT_EMPTY")
  }

  return createHash(HASH_ALGORITHM).update(normalized, "utf8").digest("hex")
}
