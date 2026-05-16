"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"

import { ProtocolDrawer } from "@/components/vouches/protocol-drawer"
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
  const [open, setOpen] = useState(false)
  const copy = vouchPageCopy.detail

  return (
    <>
      <Button className="h-12 w-full" type="button" onClick={() => setOpen(true)}>
        {copy.confirmDrawerTrigger}
        <ArrowRight className="ml-auto size-5" />
      </Button>
      <ProtocolDrawer
        open={open}
        onOpenChange={setOpen}
        title={copy.confirmDrawerTitle}
        consequence={copy.confirmDrawerBody}
        context={
          currentUserCode ? (
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-500">Your code</p>
              <p className="mt-1 font-mono text-2xl text-white">{currentUserCode}</p>
            </div>
          ) : null
        }
        finePrint={copy.oneSidedRule}
        primary={
          <form action={action} className="grid gap-4">
            <input name="vouchId" type="hidden" value={vouchId} />
            <label className="text-sm font-semibold text-neutral-300" htmlFor="submittedCode">
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
        }
      />
    </>
  )
}
