"use client"

import * as React from "react"
import {
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  Lock,
  Mail,
  MessageSquare,
  Send,
  Share2,
  ShieldCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { vouchPageCopy } from "@/content/vouches"
import type { ActionResult } from "@/types/action-resultTypes"

type ConfirmPresenceAction = (input: {
  vouchId: string
  submittedCode: string
  method: "code_exchange"
}) => Promise<ActionResult<{ vouchId: string }>>

export function ConfirmPresenceInlineForm({
  action,
  vouchId,
  currentUserCode,
  canConfirm,
  confirmationExpiresAt,
}: {
  action: ConfirmPresenceAction
  vouchId: string
  currentUserCode: string
  canConfirm: boolean
  confirmationExpiresAt: string
}) {
  const copy = vouchPageCopy.detail
  const router = useRouter()
  const [closed, setClosed] = React.useState(false)
  const [submittedCode, setSubmittedCode] = React.useState("")
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    const update = () => setClosed(Date.now() > new Date(confirmationExpiresAt).getTime())
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [confirmationExpiresAt])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(currentUserCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage(null)
    setStatusMessage(null)

    const normalizedCode = submittedCode.replace(/\s+/g, "").trim()

    if (!canConfirm || closed) {
      setErrorMessage("This participant is already confirmed or the confirmation window is closed.")
      return
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setErrorMessage("Enter the other participant's 6-digit code.")
      return
    }

    if (normalizedCode === currentUserCode) {
      setErrorMessage("That is your code. Enter the other participant's code.")
      return
    }

    startTransition(async () => {
      const result = await action({
        vouchId,
        submittedCode: normalizedCode,
        method: "code_exchange",
      })

      if (!result.ok) {
        setErrorMessage(result.formError ?? "Confirmation failed. Check the code and try again.")
        return
      }

      setSubmittedCode("")
      setStatusMessage("Confirmed. This code stays visible until the window expires.")
      router.refresh()
    })
  }

  if (closed) {
    return (
      <div className="grid gap-3 border border-neutral-600 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black tracking-wide text-white uppercase">
            Confirmation closed
          </p>
          <Lock className="size-5 text-neutral-500" />
        </div>

        <p className="text-xs leading-5 font-semibold text-neutral-400">
          The confirmation window is closed. Codes and confirmation controls are no longer valid.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-neutral-600 bg-black p-4">
      <input name="vouchId" type="hidden" value={vouchId} />

      <div className="grid gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-black tracking-wide text-white uppercase">
            {copy.confirmDrawerTrigger}
          </p>

          <span className="inline-flex items-center gap-2 border border-blue-600 bg-blue-600/10 px-2 py-1 text-[10px] font-black tracking-wide text-blue-500 uppercase">
            <ShieldCheck className="size-3.5" />
            Code exchange
          </span>
        </div>

        <p className="text-xs leading-5 font-semibold text-neutral-400">
          Keep your code visible until the window closes. The other participant needs it even after
          you confirm.
        </p>
      </div>

      <div className="grid gap-3 border border-neutral-700 bg-neutral-950 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            Your code
          </p>
          <p className="mt-2 font-mono text-4xl leading-none font-black tracking-wider text-white">
            {currentUserCode}
          </p>
        </div>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-black px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={copyCode}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {canConfirm ? (
        <>
          <label
            className="text-xs font-black tracking-wide text-neutral-400 uppercase"
            htmlFor="submittedCode"
          >
            Other participant code
          </label>

          <input
            id="submittedCode"
            className="h-12 border border-neutral-500 bg-black px-3 font-mono text-lg font-black tracking-widest text-white outline-none focus:border-blue-600"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            name="submittedCode"
            placeholder="000000"
            required
            value={submittedCode}
            onChange={(event) => setSubmittedCode(event.target.value.replace(/\D/g, ""))}
          />

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-3 border-2 border-neutral-400 bg-blue-600 px-4 text-sm font-black text-white uppercase shadow-[4px_4px_0px_black] transition hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Confirming..." : "Confirm my presence"}
            <ArrowRight className="ml-auto size-5" />
          </button>
        </>
      ) : (
        <div className="border border-blue-600 bg-blue-600/10 p-3">
          <p className="text-xs leading-5 font-black text-blue-500 uppercase">
            Your side is confirmed. Keep this code available for the other participant until the
            window expires.
          </p>
        </div>
      )}

      {errorMessage ? (
        <p className="border border-red-500 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 uppercase">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="border border-blue-600 bg-blue-600/10 px-3 py-2 text-xs font-black text-blue-500 uppercase">
          {statusMessage}
        </p>
      ) : null}
    </form>
  )
}

export function CheckoutSharePanel({
  checkoutUrl,
  publicId,
  amountLabel,
  appointmentLabel,
}: {
  checkoutUrl: string
  publicId: string
  amountLabel: string
  appointmentLabel: string
}) {
  const [copiedAction, setCopiedAction] = React.useState<string | null>(null)

  const checkoutHost = React.useMemo(() => {
    try {
      return new URL(checkoutUrl).hostname
    } catch {
      return "Stripe Checkout"
    }
  }, [checkoutUrl])

  const shareSubject = `Vouch payment authorization: ${amountLabel}`
  const shareMessage = React.useMemo(
    () =>
      [
        `Please authorize your Vouch payment through Stripe:`,
        checkoutUrl,
        ``,
        `Vouch: ${publicId}`,
        `Amount: ${amountLabel}`,
        `Appointment: ${appointmentLabel}`,
        ``,
        `The payment is authorized through Stripe. Funds are released only after both participants complete the required Vouch confirmation step.`,
      ].join("\n"),
    [amountLabel, appointmentLabel, checkoutUrl, publicId]
  )

  const mailtoHref = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(
    shareMessage
  )}`

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
          url: checkoutUrl,
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
            Customer checkout
          </p>

          <span className="w-fit border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[10px] font-black text-neutral-300 uppercase">
            Stripe hosted
          </span>
        </div>

        <p className="font-mono text-xs leading-5 font-bold break-all text-neutral-400">
          {checkoutHost}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button
          aria-label="Copy checkout link"
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={() => copyToClipboard(checkoutUrl, "link")}
        >
          {copiedAction === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
          Link
        </button>

        <button
          aria-label="Copy checkout message"
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={() => copyToClipboard(shareMessage, "message")}
        >
          {copiedAction === "message" ? (
            <Check className="size-4" />
          ) : (
            <Clipboard className="size-4" />
          )}
          Copy
        </button>

        <a
          aria-label="Email checkout message"
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          href={mailtoHref}
        >
          <Mail className="size-4" />
          Email
        </a>

        <a
          aria-label="Text checkout message"
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          href={smsHref}
        >
          <MessageSquare className="size-4" />
          Text
        </a>

        <button
          aria-label="Share checkout message"
          className="inline-flex h-11 items-center justify-center gap-2 border border-neutral-500 bg-neutral-950 px-3 text-xs font-black text-white uppercase transition hover:border-blue-600 hover:text-blue-500"
          type="button"
          onClick={shareCheckout}
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>

      <a
        className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-700 bg-neutral-950 px-3 text-xs font-black text-neutral-300 uppercase transition hover:border-blue-600 hover:text-white"
        href={whatsappHref}
        rel="noreferrer"
        target="_blank"
      >
        <Send className="size-4" />
        Send with WhatsApp
      </a>

      {copiedAction ? (
        <p className="border border-blue-600 bg-blue-600/10 px-3 py-2 text-xs font-black text-blue-500 uppercase">
          Copied to clipboard.
        </p>
      ) : null}
    </div>
  )
}

export function VouchDeadlineRefresh({
  confirmationOpensAt,
  confirmationExpiresAt,
}: {
  confirmationOpensAt: string
  confirmationExpiresAt: string
}) {
  const router = useRouter()

  React.useEffect(() => {
    const timers = [confirmationOpensAt, confirmationExpiresAt]
      .map((value) => new Date(value).getTime() - Date.now() + 1000)
      .filter((delay) => delay > 0 && delay <= 2_147_483_647)
      .map((delay) => window.setTimeout(() => router.refresh(), delay))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [confirmationExpiresAt, confirmationOpensAt, router])

  return null
}
