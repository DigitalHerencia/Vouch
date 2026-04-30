import { PaymentSettingsPage } from "@/features/settings/payment-settings-page"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getPaymentSettingsPageState } from "@/lib/fetchers/paymentFetchers"
import { refreshPaymentReadiness, startPaymentMethodSetup } from "@/lib/actions/paymentActions"

export default async function Page() {
  const user = await requireActiveUser()
  const state = await getPaymentSettingsPageState(user.id)
  async function startAction() {
    "use server"
    await startPaymentMethodSetup()
  }
  async function refreshAction() {
    "use server"
    await refreshPaymentReadiness()
  }
  return (
    <PaymentSettingsPage state={state} startAction={startAction} refreshAction={refreshAction} />
  )
}
