export interface PageHeaderProps {
  className?: string
}

export function PageHeader({ className }: PageHeaderProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/page-header.tsx</p>
    </div>
  )
}
