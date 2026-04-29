import "server-only"

type RuntimeEnv = {
  databaseUrl: string
  clerkSecretKey: string | undefined
  clerkWebhookSecret: string | undefined
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripePublishableKey: string | undefined
  appUrl: string
  vercelUrl: string | undefined
  adminEmail: string | undefined
  adminUserIds: string[]
  emailProvider: string | undefined
  emailApiUrl: string | undefined
  emailApiKey: string | undefined
  emailFrom: string | undefined
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name]
}

function getStripeWebhookSecret(): string {
  const value = getOptionalEnv("STRIPE_WEBHOOK_SECRET") ?? getOptionalEnv("STRIPE_SIGNING_SECRET")

  if (!value) {
    throw new Error("Missing required environment variable: STRIPE_WEBHOOK_SECRET")
  }

  return value
}

export function getRuntimeEnv(): RuntimeEnv {
  return {
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    clerkSecretKey: getOptionalEnv("CLERK_SECRET_KEY"),
    clerkWebhookSecret: getOptionalEnv("CLERK_WEBHOOK_SECRET"),
    stripeSecretKey: getRequiredEnv("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: getStripeWebhookSecret(),
    stripePublishableKey: getOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    appUrl:
      getOptionalEnv("NEXT_PUBLIC_APP_URL") ??
      (getOptionalEnv("VERCEL_URL") ? `https://${getOptionalEnv("VERCEL_URL")}` : "http://localhost:3000"),
    vercelUrl: getOptionalEnv("VERCEL_URL"),
    adminEmail: getOptionalEnv("ADMIN_EMAIL"),
    adminUserIds: (getOptionalEnv("ADMIN_USER_IDS") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
    emailProvider: getOptionalEnv("EMAIL_PROVIDER"),
    emailApiUrl: getOptionalEnv("EMAIL_API_URL"),
    emailApiKey: getOptionalEnv("EMAIL_API_KEY"),
    emailFrom: getOptionalEnv("EMAIL_FROM"),
  }
}

export function assertProductionEmailEnv(): void {
  if (process.env.NODE_ENV !== "production") return
  for (const name of ["EMAIL_PROVIDER", "EMAIL_API_URL", "EMAIL_API_KEY", "EMAIL_FROM"]) {
    getRequiredEnv(name)
  }
}
