import { ProviderReturnStatus } from "@/features/settings/provider-return-status"
import { handlePayoutOnboardingReturn, refreshPayoutReadiness } from "@/lib/actions/paymentActions"

type PageProps = {
  searchParams?: Promise<{
    provider?: string
    setupSessionId?: string
    account?: string
    returnTo?: string
  }>
}

export default async function PayoutReturnPage({ searchParams }: PageProps) {
  const params = await searchParams
  const setupSessionId = params?.setupSessionId ?? params?.account
  const result = setupSessionId
    ? await handlePayoutOnboardingReturn({
        provider: "stripe",
        setupSessionId,
        returnTo: params?.returnTo,
      })
    : await refreshPayoutReadiness()
  const readiness = result.ok ? result.data.readiness : "failed"

  return (
    <ProviderReturnStatus
      label="Merchant payout setup"
      title="Payout account return"
      readiness={readiness}
      message={
        readiness === "ready"
          ? "Stripe confirmed this connected account can receive Vouch payouts."
          : "Stripe has not confirmed payout readiness. Finish onboarding or refresh setup."
      }
    />
  )
}
