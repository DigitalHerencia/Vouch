export interface BackLinkProps {
  className?: string
}

export function BackLink({ className }: BackLinkProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/back-link.tsx</p>
    </div>
  )
}
