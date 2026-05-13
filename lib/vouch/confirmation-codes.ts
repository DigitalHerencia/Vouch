import { createHmac, timingSafeEqual } from "node:crypto"

import { CONFIRMATION_CODE_BUCKET_SECONDS } from "@/lib/vouch/constants"

type ParticipantRole = "merchant" | "customer"

type ConfirmationCodeInput = {
  vouchId: string
  publicId: string
  participantRole: ParticipantRole
  participantUserId: string
  at?: Date
}

type VerifyConfirmationCodeInput = ConfirmationCodeInput & {
  submittedCode: string
  allowedBucketSkew?: number
}

function confirmationSecret(): string {
  const secret =
    process.env.CONFIRMATION_CODE_SECRET ??
    process.env.CLERK_SECRET_KEY ??
    process.env.STRIPE_SECRET_KEY

  if (!secret) {
    throw new Error("Missing CONFIRMATION_CODE_SECRET, CLERK_SECRET_KEY, or STRIPE_SECRET_KEY.")
  }

  return secret
}

export function confirmationTimeBucket(at: Date = new Date()): number {
  return Math.floor(at.getTime() / 1000 / CONFIRMATION_CODE_BUCKET_SECONDS)
}

function codeForBucket(input: ConfirmationCodeInput & { bucket: number }): string {
  const payload = [
    input.vouchId,
    input.publicId,
    input.participantRole,
    input.participantUserId,
    input.bucket,
  ].join(":")

  const digest = createHmac("sha256", confirmationSecret()).update(payload).digest()
  const lastByte = digest.at(-1)
  if (lastByte === undefined) throw new Error("CONFIRMATION_CODE_DIGEST_EMPTY")

  const offset = lastByte & 0x0f
  const byte0 = digest[offset]
  const byte1 = digest[offset + 1]
  const byte2 = digest[offset + 2]
  const byte3 = digest[offset + 3]

  if (
    byte0 === undefined ||
    byte1 === undefined ||
    byte2 === undefined ||
    byte3 === undefined
  ) {
    throw new Error("CONFIRMATION_CODE_DIGEST_INVALID")
  }

  const binary =
    ((byte0 & 0x7f) << 24) | ((byte1 & 0xff) << 16) | ((byte2 & 0xff) << 8) | (byte3 & 0xff)

  return String(binary % 1_000_000).padStart(6, "0")
}

export function deriveConfirmationCode(input: ConfirmationCodeInput): string {
  return codeForBucket({ ...input, bucket: confirmationTimeBucket(input.at) })
}

export function verifyConfirmationCode(input: VerifyConfirmationCodeInput): boolean {
  const submittedCode = input.submittedCode.replace(/\s+/g, "")
  const currentBucket = confirmationTimeBucket(input.at)
  const skew = input.allowedBucketSkew ?? 0

  for (let bucket = currentBucket - skew; bucket <= currentBucket + skew; bucket += 1) {
    const expected = codeForBucket({ ...input, bucket })
    const submitted = Buffer.from(submittedCode)
    const candidate = Buffer.from(expected)

    if (submitted.length === candidate.length && timingSafeEqual(submitted, candidate)) {
      return true
    }
  }

  return false
}
