import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyRoute() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Card>
        <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground">
          Vouch minimizes collected data and stores only provider references, readiness flags,
          timestamps, participant state, and audit-safe metadata required for deterministic payment
          coordination.
        </CardContent>
      </Card>
    </main>
  )
}
