import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ConfirmPresencePageProps = {
  title: string
  statusLabel: string
  windowLabel: string
  deadlineLabel: string
  alreadyConfirmed: boolean
  canConfirm: boolean
  blockedReason?: string
  confirmationAction?: ReactNode
}

export function ConfirmPresencePage({ title, statusLabel, windowLabel, deadlineLabel, alreadyConfirmed, canConfirm, blockedReason, confirmationAction }: ConfirmPresencePageProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2"><p className="text-sm text-muted-foreground">{statusLabel}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="text-muted-foreground">Confirm presence only if you were present for the in-person appointment or agreement.</p></div>
      <Card><CardHeader><CardTitle>Confirmation window</CardTitle><CardDescription>Both parties must confirm before the deadline for funds to release.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><Info label="Window" value={windowLabel} /><Info label="Deadline" value={deadlineLabel} /></CardContent></Card>
      <Card><CardHeader><CardTitle>{alreadyConfirmed ? "Your confirmation is recorded" : "Confirm presence"}</CardTitle><CardDescription>One-sided confirmation is not enough. Funds release after both parties confirm.</CardDescription></CardHeader><CardContent className="space-y-4">{blockedReason ? <p className="text-sm text-muted-foreground">{blockedReason}</p> : null}{canConfirm && !alreadyConfirmed ? confirmationAction ?? <Button>Confirm Presence</Button> : null}{alreadyConfirmed ? <p className="text-sm text-muted-foreground">Waiting for the other party if they have not confirmed yet.</p> : null}</CardContent></Card>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-background p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>
}
