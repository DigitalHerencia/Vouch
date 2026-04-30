import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, Info, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

export function ConfirmPresencePage({
  title,
  statusLabel,
  windowLabel,
  deadlineLabel,
  alreadyConfirmed,
  canConfirm,
  blockedReason,
  confirmationAction,
}: ConfirmPresencePageProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_470px]">
        <div>
          <Link href="/vouches" className="text-sm text-blue-500">← Back to Vouch</Link>
          <h1 className="mt-5 font-heading text-5xl text-white">{title}</h1>
          <p className="mt-2 text-neutral-400">Confirm that you were present. Both parties must confirm within the window for funds to release.</p>
        </div>
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardContent className="grid gap-4 py-5 sm:grid-cols-2">
            <InfoRow label="Vouch status" value={statusLabel} />
            <InfoRow label="Created" value="May 24, 2025 at 1:45 PM" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle className="flex gap-3"><Clock className="text-blue-500" />Confirmation window</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2"><InfoRow label="Started" value={windowLabel} /><InfoRow label="Deadline" value={deadlineLabel} /></div>
            <p className="mt-8 font-mono text-4xl font-bold">01 : 23 : 47</p>
            <Progress value={45} className="mt-5 h-1 rounded-none bg-neutral-800" />
          </CardContent>
        </Card>
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle className="flex gap-3"><UserRound className="text-blue-500" />Confirmation status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Status label="Payer" value="Confirmed" ok />
            <Status label="Payee (You)" value={alreadyConfirmed ? "Confirmed" : "Not confirmed"} ok={alreadyConfirmed} />
            <p className="border border-neutral-800 p-3 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-blue-500" />If you don&apos;t confirm by the deadline, payment is refunded.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-blue-800 bg-neutral-950">
        <CardHeader><CardTitle>Your confirmation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-400">{blockedReason ?? "By confirming, you state that you were present during the meeting window."}</p>
          {canConfirm && !alreadyConfirmed ? (
            <div className="mt-6">{confirmationAction ?? <Button className="h-12 w-full rounded-none bg-blue-700">Confirm I was present <ArrowRight className="ml-auto size-5" /></Button>}</div>
          ) : <p className="mt-4 text-sm text-neutral-400">Waiting for the other party if needed.</p>}
          <p className="mt-3 text-center text-xs text-neutral-500">This action cannot be undone</p>
        </CardContent>
      </Card>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-neutral-400">{label}</p><p className="mt-1 font-mono text-white">{value}</p></div>
}

function Status({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="flex items-center justify-between border-b border-neutral-800 pb-3"><span><strong className="block text-white">{label}</strong><span className="text-sm text-neutral-400">participant</span></span><span className={ok ? "text-green-400" : "text-neutral-300"}>{value} {ok ? <CheckCircle2 className="ml-2 inline size-4" /> : null}</span></div>
}
