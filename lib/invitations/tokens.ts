import { randomBytes } from "node:crypto"

import { compareSensitiveHash, hashSensitiveValue } from "@/lib/security/hash"

const INVITATION_TOKEN_BYTES = 32
const INVITATION_TOKEN_NAMESPACE = "invitation-token"

export function createInvitationToken(byteLength = INVITATION_TOKEN_BYTES): string {
    if (!Number.isInteger(byteLength) || byteLength < 16) {
        throw new Error("Invitation tokens must contain at least 16 random bytes.")
    }

    return randomBytes(byteLength).toString("base64url")
}

export async function hashInvitationToken(token: string): Promise<string> {
    return hashSensitiveValue(token, { namespace: INVITATION_TOKEN_NAMESPACE })
}

export async function verifyInvitationTokenHash(
    token: string,
    expectedHash: string,
): Promise<boolean> {
    return compareSensitiveHash(token, expectedHash, {
        namespace: INVITATION_TOKEN_NAMESPACE,
    })
}
