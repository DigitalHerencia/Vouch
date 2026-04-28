import { PayoutSettingsPage } from "@/features/settings/payout-settings-page"
import { requireActiveUser } from "@/lib/auth/current-user"
import { getPayoutSettingsPageState } from "@/lib/fetchers/paymentFetchers"
import { refreshPayoutReadiness, startPayoutOnboarding } from "@/lib/actions/paymentActions"

export default async function Page() {
  const user = await requireActiveUser()
  const state = await getPayoutSettingsPageState(user.id)
  async function startAction() {
    "use server"
    await startPayoutOnboarding()
  }
  async function refreshAction() {
    "use server"
    await refreshPayoutReadiness()
  }
  return <PayoutSettingsPage state={state} startAction={startAction} refreshAction={refreshAction} />
}
