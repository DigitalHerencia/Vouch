export interface DashboardSectionProps {
  className?: string
}

export function DashboardSection({ className }: DashboardSectionProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/dashboard/dashboard-section.tsx</p>
    </div>
  )
}
