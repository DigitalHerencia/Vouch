import { redirect } from "next/navigation"

import { CheckoutSuccessView } from "@/components/shared/checkout-success-view"
import { claimCustomerAuthorizationCheckout } from "@/lib/actions/vouchActions"
import { getCurrentUser } from "@/lib/fetchers/authFetchers"

export async function CheckoutSuccessPage({ sessionId }: { sessionId?: string }) {
  if (!sessionId) {
    return <CheckoutSuccessView message="No Checkout Session was provided." />
  }

  const returnPath = `/checkout/success?session_id=${encodeURIComponent(sessionId)}`
  const user = await getCurrentUser()

  if (!user) {
    return (
      <CheckoutSuccessView
        message="Create or sign in to your Vouch account to securely claim this authorized Vouch."
        signInHref={`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`}
        signUpHref={`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`}
      />
    )
  }

  const result = await claimCustomerAuthorizationCheckout({ checkoutSessionId: sessionId })
  if (!result.ok) {
    return (
      <CheckoutSuccessView
        message={result.formError ?? "Vouch could not verify this Checkout Session."}
      />
    )
  }

  redirect(`/dashboard?claimed_vouch=${encodeURIComponent(result.data.vouchId)}`)
}
