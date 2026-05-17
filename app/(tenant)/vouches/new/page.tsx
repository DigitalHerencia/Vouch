import { Suspense } from "react"

import { NewVouchFeature } from "@/features/new-vouch/new-vouch-feature"
import { NewVouchSkeleton } from "@/features/new-vouch/new-vouch-skeleton"

export default function Page() {
  return (
    <Suspense fallback={<NewVouchSkeleton />}>
      <NewVouchFeature />
    </Suspense>
  )
}
