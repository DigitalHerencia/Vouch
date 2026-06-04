import { Suspense } from "react"

import { DashboardFeature } from "@/features/dashboard/dashboardFeature"
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton"

export default async function DashboardRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardFeature searchParams={await searchParams} />
    </Suspense>
  )
}
