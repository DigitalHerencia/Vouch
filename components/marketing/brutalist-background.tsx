import { cn } from "@/lib/utils"

export function BrutalistBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[80px_80px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(29,78,216,0.08),transparent_24%),radial-gradient(circle_at_82%_55%,rgba(255,255,255,0.035),transparent_28%)]" />
    </div>
  )
}

export interface CrossProps {
  small?: boolean
  className?: string
}

export function Cross({ small = false, className }: CrossProps) {
  return (
    <div className={cn("relative", small ? "size-6" : "size-8", className)} aria-hidden="true">
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
    </div>
  )
}
