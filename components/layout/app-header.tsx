export interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/app-header.tsx</p>
    </div>
  )
}
