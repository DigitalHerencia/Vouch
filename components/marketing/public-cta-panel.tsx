// components/marketing/public-cta-panel.tsx

import Link from "next/link"
import { ArrowRight, Handshake } from "lucide-react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { Button } from "@/components/ui/button"

export interface PublicCtaPanelProps {
    title?: string | undefined
    body?: string | undefined
    cta?: string | undefined
}

export function PublicCtaPanel({
    title = "Back your next appointment with commitment.",
    body = "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
    cta = "Create a Vouch",
}: PublicCtaPanelProps) {
    return (
        <CalloutPanel
            className="mt-12"
            icon={Handshake}
            title={title}
            body={body}
            actions={
                <Button
                    variant="primary"
                    size="cta"
                    className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
                    render={<Link href="/sign-up?return_to=/vouches/new" />}
                >
                    <span className="translate-y-px">{cta}</span>
                    <ArrowRight
                        className="size-5 shrink-0"
                        strokeWidth={1.9}
                    />
                </Button>
            }
        />
    )
}
