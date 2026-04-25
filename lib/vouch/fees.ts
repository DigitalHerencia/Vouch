import type { FeeBreakdown } from "@/types/payment.types"

const DEFAULT_MINIMUM_PLATFORM_FEE_CENTS = 100
const DEFAULT_PLATFORM_FEE_BASIS_POINTS = 250

export type CalculatePlatformFeeInput = {
    amountCents: number
    minimumFeeCents?: number
    basisPoints?: number
}

export function calculatePlatformFeeCents({
    amountCents,
    minimumFeeCents = DEFAULT_MINIMUM_PLATFORM_FEE_CENTS,
    basisPoints = DEFAULT_PLATFORM_FEE_BASIS_POINTS,
}: CalculatePlatformFeeInput): number {
    if (!Number.isInteger(amountCents) || amountCents < 0) {
        throw new Error("amountCents must be a non-negative integer.")
    }

    const percentageFee = Math.ceil((amountCents * basisPoints) / 10_000)

    return Math.max(minimumFeeCents, percentageFee)
}

export function getFeeBreakdown(amountCents: number): FeeBreakdown {
    const platformFeeCents = calculatePlatformFeeCents({ amountCents })

    return {
        amountCents,
        platformFeeCents,
        totalCents: amountCents + platformFeeCents,
        currency: "usd",
    }
}
