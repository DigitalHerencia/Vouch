// components/data-display/countdown.tsx

import { cn } from "@/lib/utils"

export interface CountdownProps {
    label: string
    value: string
    description?: string | undefined
    className?: string | undefined
}

export function Countdown({
    label,
    value,
    description,
    className,
}: CountdownProps) {
    return (
        <section className={cn("border border-neutral-700 bg-black/55 p-5 backdrop-blur-[2px]", className)}>
            <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-neutral-500 uppercase">
                {label}
            </p>

            <p className="mt-4 font-mono text-[34px] leading-none font-black tabular-nums text-white sm:text-[42px]">
                {value}
            </p>

            {description ? (
                <p className="mt-3 max-w-90 text-[14px] leading-[1.35] font-semibold text-neutral-400">
                    {description}
                </p>
            ) : null}
        </section>
    )
}
