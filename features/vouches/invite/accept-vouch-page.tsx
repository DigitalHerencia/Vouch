import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Info, LockKeyhole, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AcceptVouchPageProps = {
  tokenValid: boolean
  signedIn: boolean
  eligible: boolean
  amountLabel?: string
  payerLabel?: string
  windowLabel?: string
  setupHref?: string
  acceptAction?: ReactNode
  declineAction?: ReactNode
}

export function AcceptVouchPage({
  tokenValid,
  signedIn,
  eligible,
  amountLabel = "$200.00",
  payerLabel = "jordan@client.com",
  windowLabel = "May 24, 2025 · 4:00 PM - 6:00 PM",
  setupHref = "/setup",
  acceptAction,
  declineAction,
}: AcceptVouchPageProps) {
  if (!tokenValid) {
    return (
      <main className="mx-auto max-w-2xl py-16">
        <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
          <CardHeader><CardTitle>This invite is no longer available.</CardTitle></CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1fr]">
      <section>
        <Link href="/dashboard" className="text-sm text-blue-500">← Back to inbox</Link>
        <h1 className="mt-8 font-heading text-5xl text-white">You&apos;ve been invited</h1>
        <p className="mt-4 max-w-md text-neutral-400">Review the Vouch details below. Finish setup and accept to lock in this commitment.</p>
        <Summary amountLabel={amountLabel} payerLabel={payerLabel} windowLabel={windowLabel} />
        <div className="mt-6 flex gap-4 border border-neutral-800 p-5">
          <LockKeyhole className="size-8 text-neutral-400" />
          <p className="text-sm text-neutral-400"><strong className="block text-white">Secure and neutral</strong>Payments are processed by Stripe. Vouch does not hold funds and does not judge outcomes.</p>
        </div>
      </section>

      <section className="border border-neutral-800 bg-neutral-950/70 p-5">
        <h2 className="font-heading text-4xl text-white">Accept this Vouch</h2>
        <div className="mt-7 grid grid-cols-3 items-center gap-3 text-center">
          {["Review", "Setup", "Accept"].map((label, index) => (
            <div key={label}>
              <span className={index === 0 ? "mx-auto grid size-8 place-items-center rounded-full bg-blue-700 text-white" : "mx-auto grid size-8 place-items-center rounded-full bg-neutral-800 text-neutral-300"}>{index + 1}</span>
              <p className="mt-2 text-xs text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
        {!signedIn ? (
          <Notice title="Create your account to continue" body="Your invite is saved. Sign in or create an account before accepting." />
        ) : !eligible ? (
          <Notice title="Complete the steps below to accept" body="You must be verified and ready to receive funds." />
        ) : (
          <Notice title="Ready to accept" body="Both parties must confirm presence after acceptance." />
        )}
        <div className="mt-4 divide-y divide-neutral-800 border border-neutral-800">
          {["Identity verification", "18+ verification", "Payout setup", "Terms acceptance"].map((item, index) => (
            <div key={item} className="flex items-center justify-between p-4">
              <span className="flex items-center gap-4"><span className="grid size-8 place-items-center bg-neutral-800 font-mono">{index + 1}</span><strong>{item}</strong></span>
              <Badge variant="outline" className="rounded-none border-green-700 text-green-400">{index < 3 ? "Verified" : "Review terms"}</Badge>
            </div>
          ))}
        </div>
        <Card className="mt-5 rounded-none border-blue-800 bg-neutral-950">
          <CardContent className="flex gap-4 py-4">
            <Info className="size-5 text-blue-500" />
            <p className="text-sm text-neutral-400"><strong className="block text-white">What happens next?</strong>After you accept, both parties must confirm within the window. If both confirm, funds release. If not, the payment is refunded.</p>
          </CardContent>
        </Card>
        <div className="mt-5">
          {!signedIn ? (
            <div className="grid gap-3 sm:grid-cols-2"><Button className="rounded-none bg-blue-700" render={<Link href="/sign-up" />}>Sign up</Button><Button variant="outline" className="rounded-none" render={<Link href="/sign-in" />}>Sign in</Button></div>
          ) : !eligible ? (
            <Button className="h-12 w-full rounded-none bg-blue-700" render={<Link href={setupHref} />}>Review setup <ArrowRight className="ml-auto size-5" /></Button>
          ) : (
            <div>{acceptAction ?? <Button className="h-12 w-full rounded-none bg-blue-700">Accept this Vouch <ArrowRight className="ml-auto size-5" /></Button>}{declineAction}</div>
          )}
        </div>
      </section>
    </main>
  )
}

function Summary({ amountLabel, payerLabel, windowLabel }: { amountLabel: string; payerLabel: string; windowLabel: string }) {
  return (
    <Card className="mt-7 rounded-none border-neutral-800 bg-neutral-900/50">
      <CardHeader><CardTitle>Vouch summary</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="font-mono text-4xl text-white">{amountLabel} <span className="text-sm text-neutral-400">USD</span></p>
        <Line label="From" value={payerLabel} />
        <Line label="For" value="you" />
        <Line label="Label" value="Consulting call" />
        <Line label="Window" value={windowLabel} />
        <p className="border border-neutral-800 p-4 text-sm text-neutral-400"><ShieldCheck className="mr-2 inline size-4 text-blue-500" />Both parties must confirm before funds release.</p>
      </CardContent>
    </Card>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-neutral-800 pb-3 text-sm"><span className="text-neutral-400">{label}</span><span className="font-mono text-white">{value}</span></div>
}

function Notice({ title, body }: { title: string; body: string }) {
  return <div className="mt-7 border border-amber-600 bg-amber-950/10 p-4 text-sm"><strong className="block text-white">{title}</strong><span className="text-neutral-400">{body}</span></div>
}
