"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { vouchPageCopy } from "@/content/vouches"

export function ConfirmPresenceInlineForm({
  action,
  vouchId,
  currentUserCode,
}: {
  action: (formData: FormData) => void | Promise<void>
  vouchId: string
  currentUserCode?: string
}) {
  const copy = vouchPageCopy.detail

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
      <Input
        id="submittedCode"
        className="h-12 font-mono"
        inputMode="numeric"
        maxLength={6}
        minLength={6}
        name="submittedCode"
        required
      />
      <Button className="h-12 w-full" type="submit">
        Confirm my presence
        <ArrowRight className="ml-auto size-5" />
      </Button>
    </form>
  )
}
