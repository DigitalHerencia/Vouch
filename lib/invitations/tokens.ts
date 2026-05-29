import "server-only"

import { randomBytes } from "node:crypto"
import { compareSensitiveHash, hashSensitiveValue } from "@/lib/security/hash"

export async function createInvitationToken(byteLength = 32): Promise<string> {
  return randomBytes(byteLength).toString("base64url")
}

export async function hashInvitationToken(token: string): Promise<string> {
  return hashSensitiveValue(token)
}

export async function verifyInvitationTokenHash(
  token: string,
  expectedHash: string
): Promise<boolean> {
  return compareSensitiveHash(token, expectedHash)
}
