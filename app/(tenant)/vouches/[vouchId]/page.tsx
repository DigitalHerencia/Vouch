import { Suspense } from "react"

import { VouchDetailPage } from "@/features/vouches/vouchDetailFeature"

export default async function VouchDetailRoute({
  params,
}: {
  params: Promise<{ vouchId: string }>
}) {
  const { vouchId } = await params
  return (
    <Suspense
      fallback={<div className="border border-neutral-400 bg-black p-6">Loading Vouch...</div>}
    >
      <VouchDetailPage vouchId={vouchId} />
    </Suspense>
  )
}
