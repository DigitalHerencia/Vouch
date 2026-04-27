export type PlatformFeeInput = {
  amountCents: number
  percentageRate?: number
  minimumFeeCents?: number
}

export const DEFAULT_PLATFORM_FEE_RATE = 0.025
export const DEFAULT_MINIMUM_PLATFORM_FEE_CENTS = 100

export function calculatePlatformFeeCents({
  amountCents,
  percentageRate = DEFAULT_PLATFORM_FEE_RATE,
  minimumFeeCents = DEFAULT_MINIMUM_PLATFORM_FEE_CENTS,
}: PlatformFeeInput): number {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("amountCents must be a positive integer.")
  }

  if (!Number.isFinite(percentageRate) || percentageRate < 0) {
    throw new Error("percentageRate must be a non-negative finite number.")
  }

  if (!Number.isInteger(minimumFeeCents) || minimumFeeCents < 0) {
    throw new Error("minimumFeeCents must be a non-negative integer.")
  }

  const percentageFeeCents = Math.round(amountCents * percentageRate)

  return Math.max(percentageFeeCents, minimumFeeCents)
}
