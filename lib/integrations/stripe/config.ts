import "server-only"

export type StripeRuntimeConfig = {
  secretKey: string
  webhookSecret: string
  publishableKey?: string
}

export function getStripeRuntimeConfig(): StripeRuntimeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required")
  }

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required")
  }

  return {
    secretKey,
    webhookSecret,
    ...(publishableKey ? { publishableKey } : {}),
  }
}
