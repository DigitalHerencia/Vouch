import { redirect } from "next/navigation"

import { CheckoutSuccessView } from "@/components/shared/checkout-success-view"
import {
  claimCustomerAuthorizationCheckout,
  getCustomerAuthorizationCheckoutForAuthenticatedUser,
} from "@/lib/actions/vouchActions"
import { getCurrentUser } from "@/lib/fetchers/authFetchers"

export async function CheckoutSuccessPage({
  sessionId,
  publicId,
}: {
  sessionId?: string
  publicId?: string
}) {
  if (!sessionId && !publicId) {
    return <CheckoutSuccessView message="No Checkout Session was provided." />
  }

  const returnPath = sessionId
    ? `/checkout/success?session_id=${encodeURIComponent(sessionId)}`
    : `/checkout/success?vouch_id=${encodeURIComponent(publicId!)}`
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`)
  }

  if (publicId) {
    const result = await getCustomerAuthorizationCheckoutForAuthenticatedUser({ publicId })
    if (!result.ok) {
      return (
        <CheckoutSuccessView
          message={result.formError ?? "Vouch could not open customer authorization Checkout."}
        />
      )
    }

    redirect(result.data.checkoutUrl)
  }

  if (!sessionId) {
    return <CheckoutSuccessView message="No Checkout Session was provided." />
  }

  const result = await claimCustomerAuthorizationCheckout({
    checkoutSessionId: sessionId,
    revalidate: false,
  })
  if (!result.ok) {
    return (
      <CheckoutSuccessView
        message={result.formError ?? "Vouch could not verify this Checkout Session."}
      />
    )
  }

  redirect(`/dashboard?claimed_vouch=${encodeURIComponent(result.data.vouchId)}`)
}
