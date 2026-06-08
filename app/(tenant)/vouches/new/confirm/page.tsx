import { Suspense } from "react"

import { VouchForm } from "@/features/vouches/vouchForm"
import { VouchFormSkeleton } from "@/features/vouches/vouchFormSkeleton"

export default function ConfirmNewVouchRoute() {
  return (
    <Suspense fallback={<VouchFormSkeleton />}>
      <VouchForm />
    </Suspense>
  )
}
