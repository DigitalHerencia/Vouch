import type { ReactNode } from "react"
import { ArrowRight, CheckCircle2, Clock, Info, UserRound } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
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
    <main className="grid w-full gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_470px]">
        <div>
          <SectionIntro
            eyebrow="Presence confirmation"
            title={title}
            body="Confirm that you were present. Both parties must confirm within the window for funds to release."
          />
        </div>
        <Surface variant="muted" padding="md">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Vouch status" value={statusLabel} />
            <InfoRow label="Created" value="May 24, 2025 at 1:45 PM" />
          </div>
        </Surface>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="flex gap-3 font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase"><Clock className="text-[#1D4ED8]" />Confirmation window</h2>
          </SurfaceHeader>
          <SurfaceBody>
            <div className="grid gap-4 sm:grid-cols-2"><InfoRow label="Started" value={windowLabel} /><InfoRow label="Deadline" value={deadlineLabel} /></div>
            <p className="mt-8 font-mono text-4xl font-bold">01 : 23 : 47</p>
            <Progress value={45} className="mt-5 h-1 rounded-none bg-neutral-800" />
          </SurfaceBody>
        </Surface>
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="flex gap-3 font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase"><UserRound className="text-[#1D4ED8]" />Confirmation status</h2>
          </SurfaceHeader>
          <SurfaceBody className="space-y-4">
            <Status label="Payer" value="Confirmed" ok />
            <Status label="Payee (You)" value={alreadyConfirmed ? "Confirmed" : "Not confirmed"} ok={alreadyConfirmed} />
            <p className="border border-neutral-800 p-3 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-[#1D4ED8]" />If you don&apos;t confirm by the deadline, payment is refunded.</p>
          </SurfaceBody>
        </Surface>
      </div>

      <Surface className="border-blue-800 bg-neutral-950">
        <SurfaceHeader>
          <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">Your confirmation</h2>
        </SurfaceHeader>
        <SurfaceBody>
          <p className="text-sm text-neutral-400">{blockedReason ?? "By confirming, you state that you were present during the meeting window."}</p>
          {canConfirm && !alreadyConfirmed ? (
            <div className="mt-6">{confirmationAction ?? <Button className="h-12 w-full rounded-none bg-blue-700">Confirm I was present <ArrowRight className="ml-auto size-5" /></Button>}</div>
          ) : <p className="mt-4 text-sm text-neutral-400">Waiting for the other party if needed.</p>}
          <p className="mt-3 text-center text-xs text-neutral-500">This action cannot be undone</p>
        </SurfaceBody>
      </Surface>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-neutral-400">{label}</p><p className="mt-1 font-mono text-white">{value}</p></div>
}

function Status({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="flex items-center justify-between border-b border-neutral-800 pb-3"><span><strong className="block text-white">{label}</strong><span className="text-sm text-neutral-400">participant</span></span><span className={ok ? "text-green-400" : "text-neutral-300"}>{value} {ok ? <CheckCircle2 className="ml-2 inline size-4" /> : null}</span></div>
}
