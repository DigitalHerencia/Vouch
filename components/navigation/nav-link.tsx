export interface NavLinkProps {
  className?: string
}

export function NavLink({ className }: NavLinkProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/navigation/nav-link.tsx</p>
    </div>
  )
}
