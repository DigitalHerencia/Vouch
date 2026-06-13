import { Suspense } from "react"

import { VouchArchiveFeature } from "@/features/archive/vouchArchiveFeature"
import { VouchArchiveSkeleton } from "@/features/archive/vouch-archive-skeleton"

export default function VouchArchiveRoute() {
  return (
    <Suspense fallback={<VouchArchiveSkeleton />}>
      <VouchArchiveFeature />
    </Suspense>
  )
}
