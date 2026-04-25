import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export function AcceptVouchPage({ tokenValid, signedIn, eligible, amountLabel = "Unavailable", payerLabel = "Unavailable", windowLabel = "Unavailable", setupHref = "/setup", acceptAction, declineAction }: AcceptVouchPageProps) {
  if (!tokenValid) {
    return <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16"><Card><CardHeader><CardTitle>This invite is no longer available.</CardTitle><CardDescription>The Vouch may have expired, been accepted, canceled, or invalidated.</CardDescription></CardHeader></Card></main>
  }
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2"><h1 className="text-3xl font-semibold tracking-tight">Review this Vouch</h1><p className="text-muted-foreground">Accept this Vouch only if you agree to the meeting window and confirmation rules.</p></div>
      <Card><CardHeader><CardTitle>Invitation summary</CardTitle><CardDescription>Funds release only after both parties confirm.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><Summary label="Amount" value={amountLabel} /><Summary label="Payer" value={payerLabel} /><Summary label="Window" value={windowLabel} /></CardContent></Card>
      {!signedIn ? <Card><CardHeader><CardTitle>Create your account to continue.</CardTitle><CardDescription>Your invite is saved. Finish setup to review the Vouch.</CardDescription></CardHeader><CardContent className="flex gap-3"><Button render={<a href="/sign-up" />}>Sign up</Button><Button variant="outline" render={<a href="/sign-in" />}>Sign in</Button></CardContent></Card> : !eligible ? <Card><CardHeader><CardTitle>Finish setup to continue</CardTitle><CardDescription>Complete verification, payout setup, and terms before accepting Vouches that may release funds to you.</CardDescription></CardHeader><CardContent><Button render={<a href={setupHref} />}>Review setup</Button></CardContent></Card> : <Card><CardHeader><CardTitle>Accept or decline</CardTitle><CardDescription>If confirmation does not complete, the payment is refunded or not captured.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row">{acceptAction ?? <Button>Accept Vouch</Button>}{declineAction ?? <Button variant="outline">Decline</Button>}</CardContent></Card>}
    </main>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-background p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>
}
