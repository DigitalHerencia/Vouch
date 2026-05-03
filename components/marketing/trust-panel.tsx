// components/marketing/trust-panel.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { landingTrustPanelContent } from "@/content/marketing"

export function TrustPanel() {
    const TrustIcon = landingTrustPanelContent.icon

    return (
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
    )
}

