import { CreateVouchPage } from "@/features/vouches"
import { getCreateVouchPageState } from "@/lib/fetchers/vouchFetchers"

export default async function Page() {
  const state = await getCreateVouchPageState()
  return (
    <CreateVouchPage
      {...(state.variant === "blocked" ? { blockedReason: state.gate.blockers.join(", ") } : {})}
    />
  )
}
