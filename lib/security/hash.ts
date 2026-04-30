import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"

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

export async function compareSensitiveHash(value: string, expectedHash: string): Promise<boolean> {
  if (!expectedHash) return false

  const actualHash = await hashSensitiveValue(value)
  const actual = Buffer.from(actualHash, "hex")
  const expected = Buffer.from(expectedHash, "hex")

  if (actual.length !== expected.length) return false

  return timingSafeEqual(actual, expected)
}
