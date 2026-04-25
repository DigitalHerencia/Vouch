import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Pricing</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Transparent fees before commitment.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Vouch shows the amount, platform fee, and total before a payer commits funds. Final fee structure should be reviewed before production launch.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recommended MVP fee model</CardTitle>
          <CardDescription>Starting point for product validation, not legal or payment advice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-5"><p className="text-sm text-muted-foreground">Minimum platform fee</p><p className="text-4xl font-semibold tabular-nums">$1.00</p></div>
          <div className="rounded-lg border bg-background p-5"><p className="text-sm text-muted-foreground">Percentage fee</p><p className="text-4xl font-semibold tabular-nums">2.5%</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Fee rule</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-6 text-muted-foreground">Fees must be shown before payment commitment. Payment processing is handled through provider infrastructure; Vouch coordinates release/refund logic and does not directly custody funds.</p></CardContent>
      </Card>
      <div><Button render={<Link href="/vouches/new" />}>Create a Vouch</Button></div>
    </main>
  )
}
