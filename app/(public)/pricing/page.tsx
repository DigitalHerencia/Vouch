// app/(public)/pricing/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { PricingFlowPanel, PricingPanel } from "@/components/marketing/pricing-panel"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function PricingRoute() {
    return (
        <main>
            <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
                    <header className="flex max-w-170 flex-col pt-2 lg:min-h-140 lg:pt-8">
                        <PageHeader
                            title={
                                <>
                                    Know the cost
                                    <br />
                                    before the
                                    <br />
                                    commitment
                                    <br />
                                    locks.
                                </>
                            }
                            body="See the Vouch amount, platform fee, provider fee, and total before anyone commits. The release rule stays visible: both confirm in time, funds release. Otherwise, refund, void, or non-capture."
                            actions={
                                <>
                                    <Button
                                        variant="primary"
                                        size="cta"
                                        className="w-full sm:w-auto sm:min-w-62.5"
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
                                        className="w-full sm:w-auto sm:min-w-55"
                                        render={<Link href="#pricing-rule" />}
                                    >
                                        <span className="translate-y-px">View the rule</span>
                                        <ArrowDown
                                            className="size-5"
                                            strokeWidth={1.8}
                                        />
                                    </Button>
                                </>
                            }
                        />
                    </header>

                    <div className="mx-auto flex w-full max-w-130 scroll-mt-28 lg:pt-6">
                        <PricingFlowPanel className="w-full lg:min-h-140" />
                    </div>
                </div>

                <div
                    id="pricing-rule"
                    className="scroll-mt-28"
                >
                    <PricingPanel />
                </div>

                <PublicCtaPanel
                    title="Create with the total already visible."
                    body="Set the amount, show the fees, share the Vouch, and let the confirmation rule handle the outcome."
                />
            </section>
        </main>
    )
}
