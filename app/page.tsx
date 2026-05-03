// app/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { CardGrid } from "@/components/shared/card-grid"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHeader } from "@/components/shared/page-header"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import {
    landingHeroContent,
    landingMetrics,
    landingProcessSteps,
    landingTrustPanelContent,
    landingUseCases,
} from "@/content/marketing"

export default function HomePage() {
    const TrustIcon = landingTrustPanelContent.icon

    return (
        <main>
            <PublicHeader />

            <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div className="pt-2 lg:pt-8">
                        <PageHeader
                            title={landingHeroContent.title}
                            body={landingHeroContent.body}
                            actions={
                                <>
                                    <Button
                                        variant="primary"
                                        size="cta"
                                        className="min-w-62.5"
                                        render={<Link href="/sign-up?return_to=/vouches/new" />}
                                    >
                                        <span className="translate-y-px">Create a Vouch</span>
                                        <ArrowRight
                                            className="size-6"
                                            strokeWidth={1.8}
                                        />
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="cta"
                                        className="min-w-55"
                                        render={<Link href="#process" />}
                                    >
                                        <span className="translate-y-px">How it works</span>
                                        <ArrowDown
                                            className="size-5"
                                            strokeWidth={1.8}
                                        />
                                    </Button>
                                </>
                            }
                        />
                    </div>

                    <div
                        id="process"
                        className="mx-auto w-full max-w-130 scroll-mt-28 lg:pt-6"
                    >
                        <ProcessPanel
                            title="The Vouch Process"
                            steps={landingProcessSteps}
                            footer="No confirmation = refund / void"
                        />
                    </div>
                </div>

                <MetricGrid
                    items={landingMetrics}
                    className="mt-14"
                />

                <section className="mt-16">
                    <SectionIntro
                        eyebrow="Built for real life"
                        title="Protect the moments that matter."
                        body="Appointments, meetups, services, consultations, and more. Vouch keeps commitments real."
                    />

                    <CardGrid
                        items={landingUseCases}
                        className="mt-9"
                    />

                    <CalloutPanel
                        className="mt-10"
                        icon={TrustIcon}
                        title={landingTrustPanelContent.title}
                        body={landingTrustPanelContent.body}
                        actions={
                            <Button
                                variant="primary"
                                size="cta"
                                className="min-w-72"
                                render={<Link href="/sign-up?return_to=/vouches/new" />}
                            >
                                <span className="translate-y-px">Create a Vouch</span>
                                <ArrowRight
                                    className="size-5 sm:size-6"
                                    strokeWidth={1.9}
                                />
                            </Button>
                        }
                    />
                </section>
            </section>

            <PublicFooter />
        </main>
    )
}

