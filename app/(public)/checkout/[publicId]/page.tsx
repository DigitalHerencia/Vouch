import { redirect } from "next/navigation"

import { CheckoutSuccessView } from "@/components/shared/checkout-success-view"
import { checkoutSuccessContent } from "@/content/common"
import { getCustomerAuthorizationCheckoutForAuthenticatedUser } from "@/lib/actions/vouchActions"
import { getCurrentClerkAuth } from "@/lib/auth/clerk"
import { getCurrentUser } from "@/lib/fetchers/authFetchers"

export default async function AuthorizeVouchRoute({
  params,
}: {
  params: Promise<{ publicId: string }>
}) {
  const { publicId } = await params
  const normalizedPublicId = publicId.trim()
  const returnPath = `/checkout/${encodeURIComponent(normalizedPublicId)}`

  if (!normalizedPublicId) {
    return <CheckoutSuccessView message={checkoutSuccessContent.errors.authorizationCheckout} />
  }

  const user = await getCurrentUser()

  if (!user) {
    const clerkAuth = await getCurrentClerkAuth()

    if (clerkAuth.userId) {
      return (
        <CheckoutSuccessView
          message="Your account is verified. Vouch is waiting for secure account synchronization before opening this authorization."
          primaryAction={{ label: "Check again", href: returnPath }}
        />
      )
    }

    redirect(`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`)
  }

  const result = await getCustomerAuthorizationCheckoutForAuthenticatedUser({
    publicId: normalizedPublicId,
  })

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
