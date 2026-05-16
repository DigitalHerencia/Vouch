// components/feedback/empty-state.tsx

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface EmptyStateProps {
    eyebrow?: ReactNode | undefined
    title: ReactNode
    body?: ReactNode | undefined
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function EmptyState({
    eyebrow = "Empty",
    title,
    body,
    actions,
    className,
}: EmptyStateProps) {
    return (
        <section className={cn("border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px] sm:p-8", className)}>
            <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-primary uppercase">
                {eyebrow}
            </p>

            <h2 className="mt-4 font-(family-name:--font-display) text-[42px] leading-[0.92] tracking-[0.02em] text-white uppercase sm:text-[56px]">
                {title}
            </h2>

            {body ? (
                <p className="mt-5 max-w-160 text-[16px] leading-[1.4] font-semibold text-neutral-400">
                    {body}
                </p>
            ) : null}

            {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </section>
    )
}
