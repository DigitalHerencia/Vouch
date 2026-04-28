import "server-only"

import { getStripeClient } from "@/lib/stripe/client"

export function getStripeServerClient() {
  return getStripeClient()
}
