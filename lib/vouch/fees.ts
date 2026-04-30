export type VouchPricingInput = {
  protectedAmountCents: number
  stripePercentBps?: number
  stripeFixedCents?: number
}

export type VouchPricing = {
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  customerTotalCents: number
  applicationFeeAmountCents: number
}

export const DEFAULT_STRIPE_PERCENT_BPS = 290
export const DEFAULT_STRIPE_FIXED_CENTS = 30
export const DEFAULT_VOUCH_SERVICE_FEE_RATE = 0.05
export const DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS = 500

export function calculateVouchPricing({
  protectedAmountCents,
  stripePercentBps = DEFAULT_STRIPE_PERCENT_BPS,
  stripeFixedCents = DEFAULT_STRIPE_FIXED_CENTS,
}: VouchPricingInput): VouchPricing {
  if (!Number.isInteger(protectedAmountCents) || protectedAmountCents <= 0) {
    throw new Error("protectedAmountCents must be a positive integer.")
  }

  if (!Number.isInteger(stripePercentBps) || stripePercentBps < 0 || stripePercentBps >= 10_000) {
    throw new Error("stripePercentBps must be an integer from 0 to 9999.")
  }

  if (!Number.isInteger(stripeFixedCents) || stripeFixedCents < 0) {
    throw new Error("stripeFixedCents must be a non-negative integer.")
  }

  const vouchServiceFeeCents = Math.max(
    Math.ceil(protectedAmountCents * DEFAULT_VOUCH_SERVICE_FEE_RATE),
    DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS
  )

  const subtotalBeforeProcessing = protectedAmountCents + vouchServiceFeeCents
  const processingFeeOffsetCents = Math.ceil(
    (subtotalBeforeProcessing + stripeFixedCents) / (1 - stripePercentBps / 10_000) -
      subtotalBeforeProcessing
  )
  const customerTotalCents =
    protectedAmountCents + vouchServiceFeeCents + processingFeeOffsetCents
  const applicationFeeAmountCents = vouchServiceFeeCents + processingFeeOffsetCents

  return {
    protectedAmountCents,
    merchantReceivesCents: protectedAmountCents,
    vouchServiceFeeCents,
    processingFeeOffsetCents,
    customerTotalCents,
    applicationFeeAmountCents,
  }
}

export function calculatePlatformFeeCents(input: { amountCents: number }): number {
  return calculateVouchPricing({ protectedAmountCents: input.amountCents }).vouchServiceFeeCents
}
