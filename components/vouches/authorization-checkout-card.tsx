"use client"

import * as React from "react"
import { Check, Copy, ExternalLink, Mail } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

type AuthorizationCheckoutCardProps = {
  checkoutUrl: string
}

export function AuthorizationCheckoutCard({ checkoutUrl }: AuthorizationCheckoutCardProps) {
  const [copied, setCopied] = React.useState(false)
  const emailHref = `mailto:?subject=${encodeURIComponent("Authorize your Vouch")}&body=${encodeURIComponent(
    `Use this secure Stripe-hosted link to authorize your Vouch amount:\n\n${checkoutUrl}`
  )}`

  async function copyCheckoutUrl() {
    await navigator.clipboard.writeText(checkoutUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-neutral-400 bg-neutral-900 p-4">
      <p className="text-sm font-black text-white uppercase">Customer acceptance link</p>
      <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">
        Send this link to the customer. Vouch will authenticate them before opening secure Stripe
        authorization.
      </p>
      <p className="mt-4 overflow-x-auto border border-neutral-400 bg-black p-3 font-mono text-xs leading-5 text-white select-all">
        {checkoutUrl}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          aria-label="Copy authorization link"
          onClick={copyCheckoutUrl}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button size="sm" asChild>
          <Link href={emailHref}>
            <Mail />
            Email link
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={checkoutUrl} target="_blank" rel="noreferrer">
            <ExternalLink />
            Open
          </Link>
        </Button>
      </div>
    </div>
  )
}
