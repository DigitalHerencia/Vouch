import { Suspense } from "react"
import { ConfirmCreateVouchPageSkeleton } from "@/components/vouches/confirm-create-vouch-page-skeleton"
import { ConfirmCreateVouchPage } from "@/features/vouches/confirm-create-vouch-page"

export default function Page() {
  return <Suspense fallback={<ConfirmCreateVouchPageSkeleton />}><ConfirmCreateVouchPage /></Suspense>
}