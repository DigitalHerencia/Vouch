import { Suspense } from "react"
import { VouchDetailPageSkeleton } from "@/components/vouches/vouch-detail-page-skeleton"
import { VouchDetailPage } from "@/features/vouches/vouch-detail-page"

export default async function VouchDetailRoute({ params }: { params: Promise<{ vouchId: string }> }) {
  const { vouchId } = await params
  return <Suspense fallback={<VouchDetailPageSkeleton />}><VouchDetailPage vouchId={vouchId} /></Suspense>
}