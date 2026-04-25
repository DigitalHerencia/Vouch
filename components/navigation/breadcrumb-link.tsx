export interface BreadcrumbLinkProps {
  className?: string
}

export function BreadcrumbLink({ className }: BreadcrumbLinkProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/navigation/breadcrumb-link.tsx</p>
    </div>
  )
}
