import { EmptyStatePreset } from "@/components/ui/empty-state"

export function DashboardEmptyState() {
  return (
    <EmptyStatePreset
      preset="no-data"
      variant="card"
      size="lg"
      customTitle="No Vouches yet"
      customDescription="Create a Vouch when you are ready to protect an appointment deposit. Your drafts, active Vouches, and completed purchases will appear here."
    />
  )
}
