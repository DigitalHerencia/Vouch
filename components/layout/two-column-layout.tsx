export interface TwoColumnLayoutProps {
  className?: string
}

export function TwoColumnLayout({ className }: TwoColumnLayoutProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/two-column-layout.tsx</p>
    </div>
  )
}
