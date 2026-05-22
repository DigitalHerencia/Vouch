// components/feedback/status-badge.tsx

import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-none border px-3 py-2 font-(family-name:--font-display) text-[12px] leading-none tracking-[0.08em] uppercase",
  {
    variants: {
      tone: {
        neutral: "border-neutral-400 bg-black text-neutral-400",
        active: "border-blue-600 bg-blue-600 text-white",
        success: "border-blue-600 bg-blue-600 text-white",
        warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
        danger: "border-red-600 bg-red-600 text-red-600",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

export interface StatusBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "className">,
    VariantProps<typeof statusBadgeVariants> {
  label: string
}

export function StatusBadge({ label, tone, ...props }: StatusBadgeProps) {
  return (
    <span className={statusBadgeVariants({ tone })} {...props}>
      <span
        aria-hidden="true"
        className={tone === "neutral" ? "size-2 bg-blue-600 opacity-60" : "size-2 bg-blue-600"}
      />
      {label}
    </span>
  )
}

export { statusBadgeVariants }
