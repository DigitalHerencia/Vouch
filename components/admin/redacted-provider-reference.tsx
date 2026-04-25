export interface RedactedProviderReferenceProps {
  className?: string
}

export function RedactedProviderReference({ className }: RedactedProviderReferenceProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/admin/redacted-provider-reference.tsx</p>
    </div>
  )
}
