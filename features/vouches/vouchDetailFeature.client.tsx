"use client"

import * as React from "react"
import { ArrowRight, Check, Copy, Lock, ShieldCheck } from "lucide-react"
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
  const formCopy = copy.confirmationForm
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
      setErrorMessage(formCopy.errors.unavailable)
      return
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setErrorMessage(formCopy.errors.invalid)
      return
    }

    if (normalizedCode === currentUserCode) {
      setErrorMessage(formCopy.errors.ownCode)
      return
    }

    startTransition(async () => {
      try {
        const result = await action({
          vouchId,
          submittedCode: normalizedCode,
          method: "code_exchange",
        })

        if (!result.ok) {
          setErrorMessage(result.formError ?? formCopy.errors.failed)
          return
        }

        setSubmittedCode("")
        setStatusMessage(formCopy.success)
        router.refresh()
      } catch {
        setErrorMessage(formCopy.errors.failed)
        router.refresh()
      }
    })
  }

  if (closed) {
    return (
      <div className="grid gap-3 border border-neutral-600 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black tracking-wide text-white uppercase">
            {formCopy.closedTitle}
          </p>
          <Lock className="size-5 text-neutral-500" />
        </div>

        <p className="text-xs leading-5 font-semibold text-neutral-400">{formCopy.closedBody}</p>
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
            {formCopy.codeExchange}
          </span>
        </div>

        <p className="text-xs leading-5 font-semibold text-neutral-400">{formCopy.codeHelp}</p>
      </div>

      <div className="grid gap-3 border border-neutral-700 bg-neutral-950 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            {formCopy.yourCode}
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
          {copied ? formCopy.copied : formCopy.copy}
        </button>
      </div>

      {canConfirm ? (
        <>
          <label
            className="text-xs font-black tracking-wide text-neutral-400 uppercase"
            htmlFor="submittedCode"
          >
            {formCopy.otherCode}
          </label>

          <input
            id="submittedCode"
            className="h-12 border border-neutral-500 bg-black px-3 font-mono text-lg font-black tracking-widest text-white outline-none focus:border-blue-600"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            name="submittedCode"
            placeholder={formCopy.codePlaceholder}
            required
            value={submittedCode}
            onChange={(event) => setSubmittedCode(event.target.value.replace(/\D/g, ""))}
          />

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-3 border-2 border-neutral-400 bg-blue-600 px-4 text-sm font-black text-white uppercase shadow-[4px_4px_0px_black] transition hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? formCopy.confirming : formCopy.confirm}
            <ArrowRight className="ml-auto size-5" />
          </button>
        </>
      ) : (
        <div className="border border-blue-600 bg-blue-600/10 p-3">
          <p className="text-xs leading-5 font-black text-blue-500 uppercase">
            {formCopy.confirmedHelp}
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
