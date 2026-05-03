// components/data-display/timeline.tsx

import { cn } from "@/lib/utils"

export interface TimelineItem {
    label: string
    timestampLabel?: string | undefined
    body?: string | undefined
    meta?: string | undefined
}

export interface TimelineProps {
    items: TimelineItem[]
    className?: string | undefined
}

export function Timeline({ items, className }: TimelineProps) {
    return (
        <ol className={cn("grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]", className)}>
            {items.map((item, index) => (
                <li
                    key={`${item.label}-${index}`}
                    className="grid gap-4 border-b border-neutral-800 p-5 last:border-b-0 sm:grid-cols-[76px_1fr_auto] sm:p-6"
                >
                    <div className="flex size-11 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white">
                        {String(index + 1).padStart(2, "0")}
                    </div>

                    <div>
                        <h3 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.04em] text-white uppercase">
                            {item.label}
                        </h3>

                        {item.body ? (
                            <p className="mt-3 max-w-175 text-[15px] leading-[1.35] font-semibold text-neutral-400">
                                {item.body}
                            </p>
                        ) : null}
                    </div>

                    <div className="font-mono text-[12px] font-bold text-neutral-500 sm:text-right">
                        {item.timestampLabel ? <p>{item.timestampLabel}</p> : null}
                        {item.meta ? <p className="mt-2 text-neutral-600">{item.meta}</p> : null}
                    </div>
                </li>
            ))}
        </ol>
    )
}
