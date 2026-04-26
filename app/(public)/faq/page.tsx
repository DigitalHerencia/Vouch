import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FaqRoute() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">FAQ</h1>
      <div className="mt-8 grid gap-4">
        {[
          ["What is Vouch?", "A commitment-backed payment layer for appointments and in-person agreements."],
          ["When do funds release?", "Only after both parties confirm presence within the confirmation window."],
          ["What if both people do not confirm?", "The payment is refunded, voided, or not captured according to the provider flow."],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">{body}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
