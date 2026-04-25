export interface DashboardCardProps {
  className?: string
}

export function DashboardCard({ className }: DashboardCardProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/dashboard/dashboard-card.tsx</p>
    </div>
  )
}
