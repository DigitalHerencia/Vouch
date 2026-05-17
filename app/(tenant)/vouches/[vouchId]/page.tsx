import { Suspense } from "react"

import { VouchDetailFeature } from "@/features/vouch-detail/vouch-detail-feature"
import { VouchDetailSkeleton } from "@/features/vouch-detail/vouch-detail-skeleton"

export default async function VouchDetailRoute({
  params,
}: {
  params: Promise<{ vouchId: string }>
}) {
  const { vouchId } = await params
  return (
    <Suspense fallback={<VouchDetailSkeleton />}>
      <VouchDetailFeature vouchId={vouchId} />
    </Suspense>
  )
}
