import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AccountSettingsPageProps = {
  displayName?: string
  email?: string
  identityStatus: string
  adultStatus: string
  paymentReadiness: string
  payoutReadiness: string
  termsAccepted: boolean
}

export function AccountSettingsPage({
  displayName = "Vouch user",
  email = "No email available",
  identityStatus,
  adultStatus,
  paymentReadiness,
  payoutReadiness,
  termsAccepted,
}: AccountSettingsPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage private account readiness. No public profile is created.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Item label="Display name" value={displayName} />
          <Item label="Email" value={email} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Readiness</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Item label="Identity verification" value={identityStatus} />
          <Item label="Adult eligibility" value={adultStatus} />
          <Item label="Payment method" value={paymentReadiness} />
          <Item label="Payout account" value={payoutReadiness} />
          <Item label="Terms" value={termsAccepted ? "Accepted" : "Required"} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" render={<a href="/settings/verification" />}>
          Verification
        </Button>
        <Button variant="outline" render={<a href="/settings/payment" />}>
          Payment
        </Button>
        <Button variant="outline" render={<a href="/settings/payout" />}>
          Payout
        </Button>
      </div>
    </main>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-lg border p-4">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
