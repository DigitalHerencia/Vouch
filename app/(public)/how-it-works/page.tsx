import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HowItWorksRoute() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">How Vouch Works</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        One person creates a Vouch and commits funds. The other accepts. When the meeting happens,
        both parties confirm. If both confirm in time, funds release. If confirmation does not
        complete, the payment is refunded or not captured.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {["Create", "Accept", "Both confirm", "Release or refund"].map((step, index) => (
          <Card key={step}>
            <CardHeader><CardTitle>{index + 1}. {step}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Clear commitment state with no marketplace or arbitration layer.</CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
