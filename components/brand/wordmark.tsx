export interface WordmarkProps {
  className?: string
}

export function Wordmark({ className }: WordmarkProps) {
  return <span className={className}>Vouch</span>
}
