import { EmptyStatePreset } from "@/components/ui/empty-state"
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
      />
    </section>
  )
}
