export interface PublicHeaderProps {
  className?: string
}

export function PublicHeader({ className }: PublicHeaderProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/public-header.tsx</p>
    </div>
  )
}
