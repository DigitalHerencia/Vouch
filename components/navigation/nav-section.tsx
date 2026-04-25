export interface NavSectionProps {
  className?: string
}

export function NavSection({ className }: NavSectionProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/navigation/nav-section.tsx</p>
    </div>
  )
}
