import type { VouchPricing, VouchPricingInput } from "@/types/vouchTypes"

export type { VouchPricing } from "@/types/vouchTypes"

export const DEFAULT_VOUCH_SERVICE_FEE_RATE = 0.05
export const DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS = 500

export function calculateVouchPricing({ protectedAmountCents }: VouchPricingInput): VouchPricing {
  if (!Number.isInteger(protectedAmountCents) || protectedAmountCents <= 0) {
    throw new Error("protectedAmountCents must be a positive integer.")
  }

  const vouchServiceFeeCents = Math.max(
    Math.ceil(protectedAmountCents * DEFAULT_VOUCH_SERVICE_FEE_RATE),
    DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS
  )

  const customerTotalCents = protectedAmountCents
  return {
    protectedAmountCents,
    merchantReceivesCents: protectedAmountCents,
    vouchServiceFeeCents,
    customerTotalCents,
  }
}

export function calculatePlatformFeeCents(input: { amountCents: number }): number {
  return calculateVouchPricing({ protectedAmountCents: input.amountCents }).vouchServiceFeeCents
}
