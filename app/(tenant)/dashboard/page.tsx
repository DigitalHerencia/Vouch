import { Suspense } from "react"
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton"
import { DashboardPage } from "@/features/dashboard/dashboard-page"

export default function DashboardRoute() {
  return <Suspense fallback={<DashboardPageSkeleton />}><DashboardPage /></Suspense>
}