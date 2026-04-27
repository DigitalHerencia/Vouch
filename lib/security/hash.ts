import { createHmac, timingSafeEqual } from "node:crypto"

export type SensitiveHashOptions = {
    namespace?: string
    secret?: string
}

const DEFAULT_NAMESPACE = "vouch"

function getHashSecret(secret?: string): string {
    const resolvedSecret =
        secret ??
        process.env.VOUCH_HASH_SECRET ??
        process.env.AUTH_SECRET ??
        process.env.NEXTAUTH_SECRET ??
        process.env.CLERK_SECRET_KEY

    if (resolvedSecret) return resolvedSecret

    if (process.env.NODE_ENV === "production") {
        throw new Error("VOUCH_HASH_SECRET is required in production.")
    }

    return "vouch-development-only-hash-secret"
}

function normalizeSensitiveValue(value: string): string {
    const normalizedValue = value.trim()

    if (normalizedValue.length === 0) {
        throw new Error("Cannot hash an empty sensitive value.")
    }

    return normalizedValue
}

function normalizeHashNamespace(namespace?: string): string {
    const normalizedNamespace = (namespace ?? DEFAULT_NAMESPACE).trim().toLowerCase()

    if (!/^[a-z0-9._:-]+$/.test(normalizedNamespace)) {
        throw new Error("Hash namespace may only contain lowercase letters, numbers, dots, colons, hyphens, and underscores.")
    }

    return normalizedNamespace
}

export async function hashSensitiveValue(
    value: string,
    options: SensitiveHashOptions = {},
): Promise<string> {
    const namespace = normalizeHashNamespace(options.namespace)
    const normalizedValue = normalizeSensitiveValue(value)
    const digest = createHmac("sha256", getHashSecret(options.secret))
        .update(namespace)
        .update("\0")
        .update(normalizedValue)
        .digest("hex")

    return `hmac-sha256:${namespace}:${digest}`
}

export async function compareSensitiveHash(
    value: string,
    expectedHash: string,
    options: SensitiveHashOptions = {},
): Promise<boolean> {
    const actualHash = await hashSensitiveValue(value, options)
    const actualBuffer = Buffer.from(actualHash)
    const expectedBuffer = Buffer.from(expectedHash)

    if (actualBuffer.length !== expectedBuffer.length) return false

    return timingSafeEqual(actualBuffer, expectedBuffer)
}
