import { createHmac, timingSafeEqual } from "node:crypto"

import type { ParticipantRole } from "@/types/vouchTypes"

type ConfirmationCodeInput = {
  vouchId: string
  publicId: string
  participantRole: ParticipantRole
  participantUserId: string
}

type VerifyConfirmationCodeInput = ConfirmationCodeInput & {
  submittedCode: string
}

function confirmationSecret(): string {
  const secret = process.env.CONFIRMATION_CODE_SECRET

  if (!secret) {
    throw new Error("CONFIRMATION_CODE_SECRET is required.")
  }

  return secret
}

function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "").trim()
}

function codePayload(input: ConfirmationCodeInput): string {
  return [input.vouchId, input.publicId, input.participantRole, input.participantUserId].join(":")
}

function codeForParticipant(input: ConfirmationCodeInput): string {
  const digest = createHmac("sha256", confirmationSecret()).update(codePayload(input)).digest()
  const lastByte = digest.at(-1)

  if (lastByte === undefined) {
    throw new Error("CONFIRMATION_CODE_DIGEST_EMPTY")
  }

  const offset = lastByte & 0x0f
  const byte0 = digest[offset]
  const byte1 = digest[offset + 1]
  const byte2 = digest[offset + 2]
  const byte3 = digest[offset + 3]

  if (byte0 === undefined || byte1 === undefined || byte2 === undefined || byte3 === undefined) {
    throw new Error("CONFIRMATION_CODE_DIGEST_INVALID")
  }

  const binary =
    ((byte0 & 0x7f) << 24) | ((byte1 & 0xff) << 16) | ((byte2 & 0xff) << 8) | (byte3 & 0xff)

  return String(binary % 1_000_000).padStart(6, "0")
}

/**
 * Returns the stable 6-digit code for the participant.
 *
 * The code is deterministic from:
 * - Vouch database ID
 * - Vouch public ID
 * - Participant role
 * - Participant user ID
 * - CONFIRMATION_CODE_SECRET
 *
 * It does not rotate on refresh.
 */
export function deriveConfirmationCode(input: ConfirmationCodeInput): string {
  return codeForParticipant(input)
}

/** Verifies the submitted counterparty confirmation code. */
export function verifyConfirmationCode(input: VerifyConfirmationCodeInput): boolean {
  const submittedCode = normalizeCode(input.submittedCode)
  const expectedCode = codeForParticipant(input)

  const submitted = Buffer.from(submittedCode)
  const expected = Buffer.from(expectedCode)

  return submitted.length === expected.length && timingSafeEqual(submitted, expected)
}
