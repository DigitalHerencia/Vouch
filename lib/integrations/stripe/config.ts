import "server-only"

type StripeRuntimeConfig = {
  secretKey: string
  publishableKey?: string
}

type StripeWebhookSecrets = {
  snapshotSecrets: string[]
  thinSecrets: string[]
}

export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is required")
  }

  return appUrl
}

export function getStripeRuntimeConfig(): StripeRuntimeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required")
  }

  return {
    secretKey,
    ...(publishableKey ? { publishableKey } : {}),
  }
}

export function getStripeWebhookSecrets(): StripeWebhookSecrets {
  const platformSecret = process.env.STRIPE_PLATFORM_WEBHOOK_SECRET
  const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  const thinSecret = process.env.STRIPE_THIN_WEBHOOK_SECRET
  const cliSecret = process.env.STRIPE_CLI_WEBHOOK_SECRET

  // A local Stripe CLI listener signs every forwarded event with one ephemeral secret.
  if (process.env.NODE_ENV !== "production" && cliSecret) {
    return {
      snapshotSecrets: [cliSecret],
      thinSecrets: [cliSecret],
    }
  }

  if (!platformSecret || !connectSecret || !thinSecret) {
    throw new Error("Stripe platform, Connect, and thin webhook secrets are required")
  }

  return {
    snapshotSecrets: [platformSecret, connectSecret],
    thinSecrets: [thinSecret],
  }
}
