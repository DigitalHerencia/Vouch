// components/marketing/public-cta-panel.tsx

import Link from "next/link"
import { ArrowRight, Handshake } from "lucide-react"

import { vouchPrimaryButtonClassName } from "@/components/brand/vouch-button-styles"

export interface PublicCtaPanelProps {
  title?: string
  body?: string
  cta?: string
}

export function PublicCtaPanel({
  title = "Back your next appointment with commitment.",
  body = "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
  cta = "Create a Vouch",
}: PublicCtaPanelProps) {
  return (
    <section className="mt-12 grid gap-7 border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px] sm:grid-cols-[auto_1fr] sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-8">
      <div className="flex size-16 items-center justify-center sm:size-18 lg:size-20">
        <Handshake className="size-12 text-white sm:size-14 lg:size-16" strokeWidth={1.7} />
      </div>

      <div className="min-w-0">
        <h2 className="max-w-180 font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[44px] lg:text-[52px]">
          {title}
        </h2>

        <p className="mt-4 max-w-175 text-[17px] leading-[1.35] font-semibold text-neutral-400">
          {body}
        </p>
      </div>

      <Link
        href="/sign-up?return_to=/vouches/new"
        className={`${vouchPrimaryButtonClassName} w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60`}
      >
        <span className="translate-y-px">{cta}</span>
        <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
      </Link>
    </section>
  )
}
