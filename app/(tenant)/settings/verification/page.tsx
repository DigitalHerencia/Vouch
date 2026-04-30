import { VerificationSettingsPage } from "@/features/settings/verification-settings-page"
import { requireActiveUser } from "@/lib/auth/current-user"
import { getVerificationStatus } from "@/lib/fetchers/verificationFetchers"
import {
  reconcileVerificationProfile,
  startIdentityVerification,
} from "@/lib/actions/verificationActions"

export default async function Page() {
  const user = await requireActiveUser()
  const status = await getVerificationStatus(user.id)
  async function startIdentityAction() {
    "use server"
    await startIdentityVerification()
  }
  async function reconcileAction() {
    "use server"
    await reconcileVerificationProfile({})
  }
  return (
    <VerificationSettingsPage
      status={status}
      startIdentityAction={startIdentityAction}
      reconcileAction={reconcileAction}
    />
  )
}
