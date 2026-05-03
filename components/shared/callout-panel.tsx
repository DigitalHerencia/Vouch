// components/shared/callout-panel.tsx

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Surface } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface CalloutPanelProps {
    title: ReactNode
    body?: ReactNode | undefined
    icon?: LucideIcon | undefined
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function CalloutPanel({
    title,
    body,
    icon: Icon,
    actions,
    className,
}: CalloutPanelProps) {
    return (
        <Surface
            className={cn(
                "grid gap-6 p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center",
                className,
            )}
        >
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
                {Icon ? (
                    <div className="flex size-16 items-center justify-center">
                        <Icon
                            className="size-16 p-1 text-white"
                            strokeWidth={1.7}
                        />
                    </div>
                ) : null}

                <div>
                    <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-wider text-white uppercase">
                        {title}
                    </h2>

                    {body ? (
                        <p className="mt-2 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                            {body}
                        </p>
                    ) : null}
                </div>
            </div>

            {actions ? (
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                    {actions}
                </div>
            ) : null}
        </Surface>
    )
}

export { CalloutPanel as BrutalistCalloutPanel }
