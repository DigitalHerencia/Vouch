import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsRoute() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Vouch coordinates commitment-backed payment outcomes through provider infrastructure.
          Vouch is not a marketplace, escrow provider, broker, or dispute-resolution platform.
        </CardContent>
      </Card>
    </main>
  )
}
