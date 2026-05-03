// components/shared/summary-panel.tsx

import type { ReactNode } from "react"

import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface SummaryPanelRow {
    label: string
    value: ReactNode
    description?: ReactNode | undefined
}

export interface SummaryPanelProps {
    title?: ReactNode | undefined
    body?: ReactNode | undefined
    rows: SummaryPanelRow[]
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function SummaryPanel({
    title,
    body,
    rows,
    actions,
    className,
}: SummaryPanelProps) {
    return (
        <Surface className={cn(className)}>
            {title || body ? (
                <SurfaceHeader>
                    {title ? (
                        <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase sm:text-[38px]">
                            {title}
                        </h2>
                    ) : null}

                    {body ? (
                        <p className="mt-3 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                            {body}
                        </p>
                    ) : null}
                </SurfaceHeader>
            ) : null}

            <dl>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="grid gap-3 border-b border-neutral-800 p-5 last:border-b-0 sm:grid-cols-[220px_1fr] sm:p-6"
                    >
                        <dt className="font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-neutral-500 uppercase">
                            {row.label}
                        </dt>
                        <dd>
                            <div className="font-mono text-[14px] font-bold break-words text-white sm:text-[15px]">
                                {row.value}
                            </div>

                            {row.description ? (
                                <p className="mt-2 max-w-160 text-[14px] leading-[1.35] font-semibold text-neutral-500">
                                    {row.description}
                                </p>
                            ) : null}
                        </dd>
                    </div>
                ))}
            </dl>

            {actions ? (
                <div className="border-t border-neutral-800 p-6">{actions}</div>
            ) : null}
        </Surface>
    )
}

export { SummaryPanel as BrutalistSummaryPanel }
