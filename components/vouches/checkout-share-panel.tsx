"use client"

import * as React from "react"
import { Check, Clipboard, Copy, Mail, MessageSquare, Send, Share2 } from "lucide-react"

import { vouchPageCopy } from "@/content/vouches"

type CheckoutSharePanelProps = {
  checkoutUrl: string
  publicId: string
  amountLabel: string
  appointmentLabel: string
}

function getCustomerAuthorizationUrl(publicId: string): string {
  const authorizationPath = `/checkout/${encodeURIComponent(publicId)}`

  if (typeof window === "undefined") {
    return authorizationPath
  }

  return new URL(authorizationPath, window.location.origin).toString()
}

export function CheckoutSharePanel({
  checkoutUrl: _checkoutUrl,
  publicId,
  amountLabel,
  appointmentLabel,
}: CheckoutSharePanelProps) {
  const copy = vouchPageCopy.detail.checkoutShare
  const [copiedAction, setCopiedAction] = React.useState<string | null>(null)

  const authorizationUrl = React.useMemo(() => getCustomerAuthorizationUrl(publicId), [publicId])

  const authorizationHost = React.useMemo(() => {
    try {
      return new URL(authorizationUrl).hostname
    } catch {
      return copy.fallbackHost
    }
  }, [authorizationUrl, copy.fallbackHost])

  const shareSubject = `${copy.subject}: ${amountLabel}`
  const shareMessage = React.useMemo(
    () =>
      [
        copy.request,
        authorizationUrl,
        "",
        `Vouch: ${publicId}`,
        `Amount: ${amountLabel}`,
        `Appointment: ${appointmentLabel}`,
        "",
        copy.authorizationRule,
      ].join("\n"),
    [
      amountLabel,
      appointmentLabel,
      authorizationUrl,
      copy.authorizationRule,
      copy.request,
      publicId,
    ]
  )

  const mailtoHref = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareMessage)}`
  const smsHref = `sms:?&body=${encodeURIComponent(shareMessage)}`
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`

  async function copyToClipboard(value: string, actionName: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedAction(actionName)
      window.setTimeout(() => setCopiedAction(null), 1800)
    } catch {
      setCopiedAction(null)
    }
  }

  async function shareCheckout() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareSubject,
          text: shareMessage,
          url: authorizationUrl,
        })
        return
      } catch {
        return
      }
    }

    await copyToClipboard(shareMessage, "share")
  }

  return (
    <div className="grid gap-3 border border-neutral-700 bg-black p-3">
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            {copy.eyebrow}
          </p>
          <span className="w-fit border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[10px] font-black text-neutral-300 uppercase">
            {copy.hostedLabel}
          </span>
        </div>
        <p className="font-mono text-xs leading-5 font-bold break-all text-neutral-400">
          {authorizationHost}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button
          aria-label={copy.copyLinkAriaLabel}
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={() => copyToClipboard(authorizationUrl, "link")}
        >
          {copiedAction === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copy.link}
        </button>
        <button
          aria-label={copy.copyMessageAriaLabel}
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={() => copyToClipboard(shareMessage, "message")}
        >
          {copiedAction === "message" ? (
            <Check className="size-4" />
          ) : (
            <Clipboard className="size-4" />
          )}
          {copy.copy}
        </button>
        <a
          aria-label={copy.emailAriaLabel}
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          href={mailtoHref}
        >
          <Mail className="size-4" /> {copy.email}
        </a>
        <a
          aria-label={copy.textAriaLabel}
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          href={smsHref}
        >
          <MessageSquare className="size-4" /> {copy.text}
        </a>
        <button
          aria-label={copy.shareAriaLabel}
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={shareCheckout}
        >
          <Share2 className="size-4" /> {copy.share}
        </button>
      </div>

      <a
        className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-700 bg-neutral-950 px-3 text-xs font-black text-neutral-300 uppercase transition hover:border-blue-600 hover:text-white"
        href={whatsappHref}
        rel="noreferrer"
        target="_blank"
      >
        <Send className="size-4" /> {copy.whatsapp}
      </a>

      {copiedAction ? (
        <p className="border border-blue-600 bg-blue-600/10 px-3 py-2 text-xs font-black text-blue-500 uppercase">
          {copy.copied}
        </p>
      ) : null}
    </div>
  )
}
