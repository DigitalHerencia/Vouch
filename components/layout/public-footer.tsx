export interface PublicFooterProps {
  className?: string
}

export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/layout/public-footer.tsx</p>
    </div>
  )
}
