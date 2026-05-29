import "server-only"

import Stripe from "stripe"

import { getStripeRuntimeConfig } from "@/lib/integrations/stripe/config"

let cachedStripe: Stripe | undefined

export function getStripeClient(): Stripe {
  if (cachedStripe) {
    return cachedStripe
  }

  const { secretKey } = getStripeRuntimeConfig()

  cachedStripe = new Stripe(secretKey, {
    appInfo: {
      name: "Vouch",
      version: "0.1.0",
    },
    typescript: true,
  })

  return cachedStripe
}

export function getStripeServerClient() {
  return getStripeClient()
}
