// components/shared/page-header.tsx

import type { ReactNode } from "react"

import { ActionRow } from "@/components/shared/action-row"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
    eyebrow?: ReactNode
    title: ReactNode
    body?: ReactNode
    actions?: ReactNode
    className?: string
    titleClassName?: string
    bodyClassName?: string
}

export function PageHeader({
    eyebrow,
    title,
    body,
    actions,
    className,
    titleClassName,
    bodyClassName,
}: PageHeaderProps) {
    return (
        <header className={cn("max-w-170", className)}>
            {eyebrow ? (
                <div className="flex items-center gap-3">
                    <span className="size-3 bg-primary" />
                    <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
                        {eyebrow}
                    </p>
                </div>
            ) : null}

            <h1
                className={cn(
                    "font-(family-name:--font-display) text-[64px] leading-[0.86] tracking-[0.015em] text-white uppercase sm:text-[88px] lg:text-[108px]",
                    eyebrow ? "mt-6" : undefined,
                    titleClassName,
                )}
            >
                {title}
            </h1>

            {body ? (
                <p
                    className={cn(
                        "mt-7 max-w-140 text-[18px] leading-[1.35] font-semibold text-neutral-300",
                        bodyClassName,
                    )}
                >
                    {body}
                </p>
            ) : null}

            {actions ? <ActionRow>{actions}</ActionRow> : null}
        </header>
    )
}
