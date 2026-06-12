import { redirect } from "next/navigation"

import { CheckoutSuccessView } from "@/components/shared/checkout-success-view"
import { checkoutSuccessContent } from "@/content/common"
import {
  claimCustomerAuthorizationCheckout,
  getCustomerAuthorizationCheckoutForAuthenticatedUser,
} from "@/lib/actions/vouchActions"
import { getCurrentClerkAuth } from "@/lib/auth/clerk"
import { getCurrentUser } from "@/lib/fetchers/authFetchers"

export default async function CheckoutSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; vouch_id?: string }>
}) {
  const { session_id: sessionId, vouch_id: publicId } = await searchParams

  if (!sessionId && !publicId) {
    return <CheckoutSuccessView message={checkoutSuccessContent.errors.missingSession} />
  }

  const returnPath = sessionId
    ? `/checkout/success?session_id=${encodeURIComponent(sessionId)}`
    : `/checkout/success?vouch_id=${encodeURIComponent(publicId!)}`
  const user = await getCurrentUser()

  if (!user) {
    const clerkAuth = await getCurrentClerkAuth()
    if (clerkAuth.userId) {
      return (
        <CheckoutSuccessView
          message="Your account is verified. Vouch is waiting for secure account synchronization before claiming this authorization."
          primaryAction={{ label: "Check again", href: returnPath }}
        />
      )
    }

    redirect(`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`)
  }

  if (publicId) {
    const result = await getCustomerAuthorizationCheckoutForAuthenticatedUser({ publicId })

    if (!result.ok) {
      return (
        <CheckoutSuccessView
          message={result.formError ?? checkoutSuccessContent.errors.authorizationCheckout}
          primaryAction={{ label: "Try authorization again", href: returnPath }}
        />
      )
    }

    redirect(result.data.checkoutUrl)
  }

  if (!sessionId) {
    return <CheckoutSuccessView message={checkoutSuccessContent.errors.missingSession} />
  }

  const result = await claimCustomerAuthorizationCheckout({
    checkoutSessionId: sessionId,
    revalidate: false,
  })

  if (!result.ok) {
    return (
      <CheckoutSuccessView
        message={result.formError ?? checkoutSuccessContent.errors.verifySession}
        primaryAction={{ label: "Verify checkout again", href: returnPath }}
      />
    )
  }

  redirect(`/dashboard?claimed_vouch=${encodeURIComponent(result.data.vouchId)}`)
}
