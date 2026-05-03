// components/marketing/pricing-panel.tsx

import { MetricGrid } from "@/components/shared/metric-grid"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { pricingFlowSteps, pricingNotes, pricingStats } from "@/content/pricing"
import { cn } from "@/lib/utils"

export function PricingFlowPanel({
    className,
}: {
    className?: string | undefined
}) {
    return (
        <ProcessPanel
            title="Payment flow"
            steps={pricingFlowSteps}
            footer="Both confirm = release"
            className={cn("flex w-full flex-col", className)}
        />
    )
}

export function PricingPanel() {
    return (
        <section className="mt-14 grid gap-12">
            <MetricGrid items={pricingStats} />

            <section className="grid divide-y divide-neutral-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                {pricingNotes.map((note) => (
                    <article
                        key={note.title}
                        className="grid min-h-84 grid-rows-[auto_112px_1fr] py-8 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
                    >
                        <SectionIntro
                            eyebrow={note.eyebrow}
                            title={note.title}
                            body={note.body}
                            titleClassName="max-w-90 text-[34px] sm:text-[42px]"
                            bodyClassName="max-w-95 text-[17px]"
                        />
                    </article>
                ))}
            </section>
        </section>
    )
}
