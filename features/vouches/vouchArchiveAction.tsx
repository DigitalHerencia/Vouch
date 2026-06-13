"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/types/action-resultTypes"

type ArchiveAction = (input: { vouchId: string }) => Promise<ActionResult<{ vouchId: string }>>

export function VouchArchiveAction({
  action,
  refresh,
  vouchId,
}: {
  action: ArchiveAction
  refresh?: () => void
  vouchId: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleArchive() {
    setError(null)
    startTransition(async () => {
      const result = await action({ vouchId })
      if (!result.ok) {
        setError(result.formError ?? "Unable to archive this Vouch.")
        return
      }
      ;(refresh ?? router.refresh)()
    })
  }

  return (
    <div className="grid justify-items-start gap-2">
      <Button type="button" variant="outline" disabled={pending} onClick={handleArchive}>
        {pending ? "Archiving..." : "Archive Vouch"}
      </Button>
      {error ? <p className="text-sm font-semibold text-red-300">{error}</p> : null}
    </div>
  )
}
