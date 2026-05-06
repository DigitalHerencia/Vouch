import { ProviderReturnStatus } from "@/features/settings/provider-return-status"
import {
  handlePaymentMethodSetupReturn,
  refreshPaymentReadiness,
} from "@/lib/actions/paymentActions"

type PageProps = {
  searchParams?: Promise<{
    provider?: string
    setup_intent?: string
    setupSessionId?: string
    returnTo?: string
  }>
}

export default async function PaymentReturnPage({ searchParams }: PageProps) {
  const params = await searchParams
  const setupSessionId = params?.setup_intent ?? params?.setupSessionId
  const result = setupSessionId
    ? await handlePaymentMethodSetupReturn({
        provider: "stripe",
        setupSessionId,
        returnTo: params?.returnTo,
      })
    : await refreshPaymentReadiness()
  const readiness = result.ok ? result.data.readiness : "failed"

  return (
    <ProviderReturnStatus
      label="Customer payment setup"
      title="Payment method return"
      readiness={readiness}
      message={
        readiness === "ready"
          ? "Stripe confirmed a usable payment method for future Vouch authorization."
          : "Stripe has not confirmed a ready payment method. Refresh or complete setup again."
      }
    />
  )
}
