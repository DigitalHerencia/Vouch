import Link from "next/link"

import { EmptyStatePreset } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { dashboardContent } from "@/content/dashboard"

export function DashboardEmptyState() {
  return (
    <section>
      <EmptyStatePreset
        preset="no-data"
        variant="card"
        size="lg"
        customTitle={dashboardContent.emptyState.title}
        customDescription={dashboardContent.emptyState.description}
        action={
          <Button asChild>
            <Link href="/vouches/new">{dashboardContent.cta.label}</Link>
          </Button>
        }
      />
    </section>
  )
}
