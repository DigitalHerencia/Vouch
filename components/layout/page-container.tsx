export interface PageContainerProps {
  className?: string
}

export function PageContainer({ className }: PageContainerProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/page-container.tsx</p>
    </div>
  )
}
