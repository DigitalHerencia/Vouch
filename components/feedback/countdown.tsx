export interface CountdownProps {
  className?: string
}

export function Countdown({ className }: CountdownProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/countdown.tsx</p>
    </div>
  )
}
