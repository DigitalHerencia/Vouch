// components/shared/cta-panel.tsx

import Link from "next/link"
import { ArrowRight, Handshake, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CalloutPanel } from "@/components/shared/callout-panel"

export interface CtaPanelProps {
    title?: string | undefined
    body?: string | undefined
    cta?: string | undefined
    href?: string | undefined
    icon?: LucideIcon | undefined
    className?: string | undefined
}

export function CtaPanel({
    title = "Back your next appointment with commitment.",
    body = "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
    cta = "Create a Vouch",
    href = "/sign-up?return_to=/vouches/new",
    icon = Handshake,
    className,
}: CtaPanelProps) {
    return (
        <CalloutPanel
            className={className ?? "mt-12"}
            icon={icon}
            title={title}
            body={body}
            actions={
                <Button
                    variant="primary"
                    size="cta"
                    className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
                    render={<Link href={href} />}
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
