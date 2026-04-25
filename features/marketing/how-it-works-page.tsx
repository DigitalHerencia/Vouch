import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  ["Create a Vouch", "The payer enters the amount, meeting window, and recipient or share-link choice."],
  ["The other party accepts", "The payee reviews the amount, timing, and confirmation rules before accepting."],
  ["Both confirm presence", "During the confirmation window, each participant records their own confirmation."],
  ["Funds release or refund", "Both confirmations release funds. Missing confirmation refunds, voids, or prevents capture."],
] as const

export function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">How it works</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">A simple rule, enforced automatically.</h1>
        <p className="max-w-3xl text-muted-foreground">
          One person commits funds. The other accepts. Both confirm presence during the window. If both confirmations happen, funds release. If not, the payment is refunded or not captured.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map(([title, body], index) => (
          <Card key={title}>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Step {index + 1}</p>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">{body}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>What Vouch does not do</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p>No marketplace discovery.</p><p>No public provider listings.</p><p>No dispute arbitration.</p>
        </CardContent>
      </Card>
      <div><Button render={<Link href="/vouches/new" />}>Create a Vouch</Button></div>
    </main>
  )
}
