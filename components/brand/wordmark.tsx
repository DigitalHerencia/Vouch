export interface WordmarkProps {
  className?: string
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/brand/wordmark.tsx</p>
    </div>
  )
}
