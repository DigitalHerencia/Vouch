// components/feedback/error-state.tsx

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface ErrorStateProps {
    eyebrow?: ReactNode | undefined
    title: ReactNode
    body?: ReactNode | undefined
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function ErrorState({
    eyebrow = "Error",
    title,
    body,
    actions,
    className,
}: ErrorStateProps) {
    return (
        <section className={cn("border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px] sm:p-8", className)}>
            <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-red-300 uppercase">
                {eyebrow}
            </p>

            <h1 className="mt-4 font-(family-name:--font-display) text-[48px] leading-[0.9] tracking-[0.02em] text-white uppercase sm:text-[64px]">
                {title}
            </h1>

            {body ? (
                <p className="mt-5 max-w-160 text-[16px] leading-[1.4] font-semibold text-neutral-400">
                    {body}
                </p>
            ) : null}

            {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </section>
    )
}
