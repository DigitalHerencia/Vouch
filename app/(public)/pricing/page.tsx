import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingRoute() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Simple payment coordination</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3">
          <p>Provider processing fees are shown before payment commitment.</p>
          <p>Vouch does not hold funds directly and does not operate as escrow.</p>
        </CardContent>
      </Card>
    </main>
  )
}
