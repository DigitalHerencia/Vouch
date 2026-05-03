// components/data-display/summary-list.tsx

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface SummaryListItem {
    label: string
    value: ReactNode
    description?: ReactNode | undefined
}

export interface SummaryListProps {
    items: SummaryListItem[]
    className?: string | undefined
}

export function SummaryList({ items, className }: SummaryListProps) {
    return (
        <dl className={cn("grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]", className)}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className="grid gap-3 border-b border-neutral-800 p-5 last:border-b-0 sm:grid-cols-[220px_1fr] sm:p-6"
                >
                    <dt className="font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-neutral-500 uppercase">
                        {item.label}
                    </dt>
                    <dd>
                        <div className="font-mono text-[14px] font-bold break-words text-white sm:text-[15px]">
                            {item.value}
                        </div>
                        {item.description ? (
                            <p className="mt-2 max-w-160 text-[14px] leading-[1.35] font-semibold text-neutral-500">
                                {item.description}
                            </p>
                        ) : null}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
