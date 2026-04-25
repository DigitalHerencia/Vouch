export interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/app-sidebar.tsx</p>
    </div>
  )
}
