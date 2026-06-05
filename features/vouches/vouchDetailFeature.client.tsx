"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { vouchPageCopy } from "@/content/vouches"

export function ConfirmPresenceInlineForm({
  action,
  vouchId,
  currentUserCode,
  confirmationExpiresAt,
}: {
  action: (formData: FormData) => void | Promise<void>
  vouchId: string
  currentUserCode?: string
  confirmationExpiresAt: string
}) {
  const copy = vouchPageCopy.detail
  const [closed, setClosed] = React.useState(false)

  React.useEffect(() => {
    const update = () => setClosed(Date.now() > new Date(confirmationExpiresAt).getTime())
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [confirmationExpiresAt])

  if (closed) {
    return (
      <div className="border border-neutral-400 bg-neutral-900 p-4 text-sm font-semibold text-neutral-400">
        The confirmation window is closed. Codes and confirmation controls are no longer valid.
      </div>
    )
  }

  return (
    <form action={action} className="grid gap-4 border border-neutral-400 bg-neutral-900 p-4">
      <input name="vouchId" type="hidden" value={vouchId} />
      <div>
        <p className="text-sm font-black tracking-wide text-white uppercase">
          {copy.confirmDrawerTrigger}
        </p>
        <p className="mt-1 text-xs leading-5 font-semibold text-neutral-400">
          {copy.confirmDrawerBody}
        </p>
      </div>
      {currentUserCode ? (
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase">Your code</p>
          <p className="mt-1 font-mono text-2xl text-white">{currentUserCode}</p>
        </div>
      ) : null}
      <label className="text-sm font-semibold text-neutral-400" htmlFor="submittedCode">
        Other participant code
      </label>
      <input
        id="submittedCode"
        className="h-12 border border-neutral-400 bg-black px-3 font-mono text-sm font-bold text-white outline-none focus:border-blue-600"
        inputMode="numeric"
        maxLength={6}
        minLength={6}
        name="submittedCode"
        required
      />
      <button
        className="inline-flex h-12 w-full items-center justify-center gap-3 border-2 border-neutral-400 bg-blue-600 px-4 text-sm font-black text-white uppercase shadow-[4px_4px_0px_black] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
        type="submit"
      >
        Confirm my presence
        <ArrowRight className="ml-auto size-5" />
      </button>
    </form>
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
