// components/shared/content-section-list.tsx

import type { ReactNode } from "react"

import { Surface } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface ContentSectionListItem {
    heading: ReactNode
    body: readonly ReactNode[]
}

export interface ContentSectionListProps {
    sections: readonly ContentSectionListItem[]
    className?: string | undefined
    sectionClassName?: string | undefined
    headingClassName?: string | undefined
    bodyClassName?: string | undefined
    paragraphClassName?: string | undefined
}

export function ContentSectionList({
    sections,
    className,
    sectionClassName,
    headingClassName,
    bodyClassName,
    paragraphClassName,
}: ContentSectionListProps) {
    return (
        <Surface className={cn("mt-14", className)}>
            {sections.map((section, sectionIndex) => (
                <section
                    key={sectionIndex}
                    className={cn(
                        "border-b border-neutral-800 p-6 last:border-b-0 sm:p-7",
                        sectionClassName,
                    )}
                >
                    <h2
                        className={cn(
                            "font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[42px]",
                            headingClassName,
                        )}
                    >
                        {section.heading}
                    </h2>

                    <div className={cn("mt-5 grid gap-4", bodyClassName)}>
                        {section.body.map((line, lineIndex) => (
                            <p
                                key={`${sectionIndex}-${lineIndex}`}
                                className={cn(
                                    "max-w-230 text-base leading-[1.45] font-semibold text-neutral-400 sm:text-lg",
                                    paragraphClassName,
                                )}
                            >
                                {line}
                            </p>
                        ))}
                    </div>
                </section>
            ))}
        </Surface>
    )
}
