import { redirect } from "next/navigation"

import { CheckoutSuccessView } from "@/components/shared/checkout-success-view"
import { checkoutSuccessContent } from "@/content/common"
import { claimCustomerAuthorizationCheckout } from "@/lib/actions/vouchActions"
import { getCurrentClerkAuth } from "@/lib/auth/clerk"
import { getCurrentUser } from "@/lib/fetchers/authFetchers"

export default async function CheckoutSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    return <CheckoutSuccessView message={checkoutSuccessContent.errors.missingSession} />
  }

  const returnPath = `/checkout/success?session_id=${encodeURIComponent(sessionId)}`
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
