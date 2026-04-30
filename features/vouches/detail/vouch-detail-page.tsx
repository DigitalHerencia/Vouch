import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock, Info, UserRound } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type ConfirmationState = {
  payerConfirmed: boolean
  payeeConfirmed: boolean
  canConfirm: boolean
  confirmHref?: string
}

type VouchDetailPageProps = {
  title: string
  amountLabel: string
  statusLabel: string
  roleLabel: string
  otherPartyLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  finalOutcomeLabel?: string
  confirmation: ConfirmationState
  timeline?: { label: string; timestampLabel: string }[]
}

export function VouchDetailPage({
  title,
  amountLabel,
  statusLabel,
  roleLabel,
  otherPartyLabel,
  windowLabel,
  deadlineLabel,
  paymentStatusLabel,
  finalOutcomeLabel,
  confirmation,
  timeline = [],
}: VouchDetailPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5">
      <div>
        <Link href="/vouches" className="text-sm text-blue-500">← Back to vouches</Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <Badge className="rounded-none bg-blue-700 text-white">{statusLabel}</Badge>
            <h1 className="mt-3 font-heading text-5xl text-white">{title}</h1>
            <p className="mt-2 font-mono text-sm text-neutral-400">Vouch ID <span className="rounded bg-neutral-800 px-2 text-neutral-200">vou_1A2b3c4D5e6F7g8H</span></p>
          </div>
          <Button variant="outline" className="rounded-none" render={<Link href={`/vouches/${encodeURIComponent(title)}`} />}>Share</Button>
        </div>
      </div>

      <section className="grid gap-4 border-y border-neutral-800 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBlock icon={<UserRound />} label={`From (${roleLabel})`} value={otherPartyLabel} />
        <InfoBlock icon={<UserRound />} label="To (Payee)" value="you" />
        <InfoBlock icon={<CalendarDays />} label="Amount" value={amountLabel} />
        <InfoBlock icon={<Clock />} label="Window" value={windowLabel} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle>Confirmation status</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-400">Both parties must confirm presence within the window for funds to release.</p>
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Party label="Payer" confirmed={confirmation.payerConfirmed} />
              <div className="grid size-28 place-items-center rounded-full border-4 border-blue-700 text-center font-mono text-sm text-white">Waiting<br />for you</div>
              <Party label="Payee (you)" confirmed={confirmation.payeeConfirmed} align="right" />
            </div>
            {confirmation.canConfirm && confirmation.confirmHref ? (
              <Button className="mt-7 h-12 w-full rounded-none bg-blue-700" render={<Link href={confirmation.confirmHref} />}>
                Confirm my presence
              </Button>
            ) : null}
            <p className="mt-4 border border-neutral-800 p-3 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-blue-500" />If you don&apos;t confirm by the deadline, the payment will be refunded to the payer.</p>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
            <CardHeader><CardTitle>Time remaining</CardTitle></CardHeader>
            <CardContent>
              <p className="font-mono text-4xl font-bold text-white">01 : 47 : 32</p>
              <p className="mt-2 text-sm text-neutral-300">Deadline: {deadlineLabel}</p>
              <Progress value={62} className="mt-4 h-1 rounded-none bg-neutral-800" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
            <CardHeader><CardTitle>Payment details</CardTitle></CardHeader>
            <CardContent className="font-mono text-sm">
              <Line label="Vouch amount" value={amountLabel} />
              <Line label="Platform fee" value="$6.00" />
              <Line label="Total charged" value="$206.00" strong />
              <p className="mt-4"><Badge className="rounded-none border-green-700 bg-green-950 text-green-400">{paymentStatusLabel}</Badge></p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(timeline.length ? timeline : [
              { label: "Vouch created by payer", timestampLabel: "May 24, 1:45 PM" },
              { label: "Payer confirmed presence", timestampLabel: "May 24, 4:12 PM" },
              { label: "Payee confirmation pending", timestampLabel: "Waiting for you" },
              { label: "Funds will release or refund", timestampLabel: "Automatically determined" },
            ]).map((event, index) => (
              <div key={`${event.label}-${event.timestampLabel}`} className="grid grid-cols-[20px_1fr_auto] gap-3 text-sm">
                <CheckCircle2 className={index < 2 ? "size-5 text-blue-500" : "size-5 text-neutral-600"} />
                <span className="text-white">{event.label}</span>
                <span className="font-mono text-neutral-400">{event.timestampLabel}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle>What happens next?</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm text-neutral-400">
            <p><CheckCircle2 className="mr-2 inline size-4 text-green-500" />Both confirm in time: funds release.</p>
            <p><Info className="mr-2 inline size-4 text-amber-500" />One or both do not confirm: refund or non-capture.</p>
            <p>{finalOutcomeLabel ?? "No arbitration. Vouch follows the confirmation rule."}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex gap-3 text-sm text-neutral-400">{icon}<span><span className="block">{label}</span><strong className="font-mono text-white">{value}</strong></span></div>
}

function Party({ label, confirmed, align }: { label: string; confirmed: boolean; align?: "right" }) {
  return <div className={align === "right" ? "text-right" : ""}><p className="vouch-label text-white">{label}</p><p className={confirmed ? "text-green-400" : "text-neutral-400"}>{confirmed ? "Confirmed" : "Not confirmed"}</p></div>
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex justify-between border-b border-neutral-800 py-2"><span className="text-neutral-300">{label}</span><span className={strong ? "text-blue-500" : "text-white"}>{value}</span></div>
}
