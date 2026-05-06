import { PaymentSettingsPage } from "@/features/settings/payment-settings-page"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getPaymentSettingsPageState } from "@/lib/fetchers/paymentFetchers"
import { refreshPaymentReadiness, startPaymentMethodSetup } from "@/lib/actions/paymentActions"

export default async function Page() {
  const user = await requireActiveUser()
  const state = await getPaymentSettingsPageState(user.id)
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  async function startAction() {
    "use server"
    return startPaymentMethodSetup()
  }
  async function refreshAction() {
    "use server"
    await refreshPaymentReadiness()
  }
  return (
    <PaymentSettingsPage
      state={state}
      publishableKey={stripePublishableKey}
      startAction={startAction}
      refreshAction={refreshAction}
    />
  )
}
