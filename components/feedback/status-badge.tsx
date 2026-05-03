// components/feedback/status-badge.tsx

import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
    "inline-flex items-center gap-2 rounded-none border px-3 py-2 font-(family-name:--font-display) text-[12px] leading-none tracking-[0.08em] uppercase",
    {
        variants: {
            tone: {
                neutral: "border-neutral-700 bg-black/55 text-neutral-300",
                active: "border-primary bg-primary/10 text-white",
                success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
                danger: "border-red-500/40 bg-red-500/10 text-red-200",
            },
        },
        defaultVariants: {
            tone: "neutral",
        },
    },
)

export interface StatusBadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof statusBadgeVariants> {
    label: string
}

export function StatusBadge({
    label,
    tone,
    className,
    ...props
}: StatusBadgeProps) {
    return (
        <span
            className={cn(statusBadgeVariants({ tone }), className)}
            {...props}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "size-2 bg-current",
                    tone === "neutral" ? "opacity-60" : undefined,
                )}
            />
            {label}
        </span>
    )
}

export { statusBadgeVariants }
