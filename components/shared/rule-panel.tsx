// components/shared/rule-panel.tsx

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface RulePanelItem {
    title: string
    body: string
    label?: string | undefined
    icon?: LucideIcon | undefined
}

export interface RulePanelProps {
    title: ReactNode
    body?: ReactNode | undefined
    items: RulePanelItem[]
    className?: string | undefined
}

export function RulePanel({ title, body, items, className }: RulePanelProps) {
    return (
        <Surface className={cn(className)}>
            <SurfaceHeader>
                <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase sm:text-[38px]">
                    {title}
                </h2>

                {body ? (
                    <p className="mt-3 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                        {body}
                    </p>
                ) : null}
            </SurfaceHeader>

            <div>
                {items.map((item, index) => {
                    const Icon = item.icon

                    return (
                        <article
                            key={`${item.title}-${index}`}
                            className="grid gap-5 border-b border-neutral-800 p-6 last:border-b-0 sm:grid-cols-[76px_1fr_auto] sm:p-7"
                        >
                            <div className="flex size-11 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-12 sm:text-lg">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <div>
                                <h3 className="font-(family-name:--font-display) text-[28px] leading-none tracking-[0.04em] text-white uppercase sm:text-[34px]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 max-w-190 text-base leading-[1.35] font-semibold text-neutral-400 sm:text-lg">
                                    {item.body}
                                </p>
                            </div>

                            <div
                                className={cn(
                                    "flex items-start justify-end",
                                    !Icon && !item.label ? "hidden" : undefined,
                                )}
                            >
                                {Icon ? (
                                    <Icon
                                        className="size-8 text-white"
                                        strokeWidth={1.8}
                                    />
                                ) : (
                                    <span className="font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-primary uppercase">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </article>
                    )
                })}
            </div>
        </Surface>
    )
}

export { RulePanel as BrutalistRulePanel }
