import type { ReactNode } from "react"
import { ArrowRight, CheckCircle2, Clock, Info, UserRound } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { vouchPageCopy } from "@/content/vouches"

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
  const copy = vouchPageCopy.confirm

  return (
    <main className="grid w-full gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_470px]">
        <div>
          <SectionIntro
            eyebrow={copy.eyebrow}
            title={title}
            body={copy.body}
          />
        </div>
        <Surface variant="muted" padding="md">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label={copy.labels.vouchStatus} value={statusLabel} />
            <InfoRow label={copy.labels.created} value={copy.fallbackCreatedAt} />
          </div>
        </Surface>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="flex gap-3 text-[26px] leading-none text-white"><Clock className="text-primary" />{copy.sections.window}</h2>
          </SurfaceHeader>
          <SurfaceBody>
            <div className="grid gap-4 sm:grid-cols-2"><InfoRow label={copy.labels.started} value={windowLabel} /><InfoRow label={copy.labels.deadline} value={deadlineLabel} /></div>
            <p className="mt-8 font-mono text-4xl font-bold text-white">{copy.countdownPlaceholder}</p>
            <Progress value={45} className="mt-5 h-1 rounded-none bg-neutral-800" />
          </SurfaceBody>
        </Surface>
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="flex gap-3 text-[26px] leading-none text-white"><UserRound className="text-primary" />{copy.sections.status}</h2>
          </SurfaceHeader>
          <SurfaceBody className="space-y-4">
            <Status label={copy.labels.payer} value={copy.states.confirmed} ok />
            <Status label={copy.labels.payeeYou} value={alreadyConfirmed ? copy.states.confirmed : copy.states.notConfirmed} ok={alreadyConfirmed} />
            <p className="border border-neutral-800 p-3 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-primary" />{copy.deadlineConsequence}</p>
          </SurfaceBody>
        </Surface>
      </div>

      <Surface className="border-primary bg-neutral-950">
        <SurfaceHeader>
          <h2 className="text-[26px] leading-none text-white">{copy.sections.yourConfirmation}</h2>
        </SurfaceHeader>
        <SurfaceBody>
          <p className="text-sm text-neutral-400">{blockedReason ?? copy.confirmationBody}</p>
          {canConfirm && !alreadyConfirmed ? (
            <div className="mt-6">{confirmationAction ?? <Button className="h-12 w-full">{copy.confirmAction} <ArrowRight className="ml-auto size-5" /></Button>}</div>
          ) : <p className="mt-4 text-sm text-neutral-400">{copy.states.waiting}</p>}
          <p className="mt-3 text-center text-xs text-neutral-500">{copy.irreversible}</p>
        </SurfaceBody>
      </Surface>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-neutral-400">{label}</p><p className="mt-1 font-mono text-white">{value}</p></div>
}

function Status({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="flex items-center justify-between border-b border-neutral-800 pb-3"><span><strong className="block text-white">{label}</strong><span className="text-sm text-neutral-400">{vouchPageCopy.confirm.labels.participant}</span></span><span className={ok ? "text-green-400" : "text-neutral-300"}>{value} {ok ? <CheckCircle2 className="ml-2 inline size-4" /> : null}</span></div>
}
