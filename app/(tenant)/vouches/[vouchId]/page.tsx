import { Suspense } from "react"

import { VouchDetailSkeleton } from "@/features/vouches/vouch-detail-skeleton"
import { VouchDetailPage } from "@/features/vouches/vouchDetailFeature"

export default async function VouchDetailRoute({
  params,
}: {
  params: Promise<{ vouchId: string }>
}) {
  const { vouchId } = await params
  return (
    <Suspense fallback={<VouchDetailSkeleton />}>
      <VouchDetailPage vouchId={vouchId} />
    </Suspense>
  )
}
