export interface AppShellProps {
  className?: string
}

export function AppShell({ className }: AppShellProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/app-shell.tsx</p>
    </div>
  )
}
