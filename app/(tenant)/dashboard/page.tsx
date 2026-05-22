import { Suspense } from "react"

import { DashboardFeature } from "@/features/dashboard/dashboardFeature"
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton"

export default function DashboardRoute() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardFeature />
    </Suspense>
  )
}
