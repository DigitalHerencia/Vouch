import { CheckCircle2, CreditCard, LockKeyhole, RotateCw, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethodSetupForm } from "./payment-method-setup-form"

type PaymentSettingsPageProps = {
  state?: { variant?: string; readiness?: { readiness?: string | null } | null }
  publishableKey?: string | undefined
  startAction?: () => Promise<
    | { ok: true; data: { clientSecret?: string | null } }
    | { ok: false; formError?: string; code?: string }
  >
  refreshAction?: (formData: FormData) => void | Promise<void>
}

export function PaymentSettingsPage({
  state,
  publishableKey,
  startAction,
  refreshAction,
}: PaymentSettingsPageProps) {
  const readiness = state?.readiness?.readiness ?? "not_started"
  const ready = readiness === "ready"
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5">
      <div>
        <p className="vouch-label text-blue-500">Customer setup</p>
        <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">Payment method</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Add a provider-secure payment method for accepting and authorizing Vouches.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <Card className="rounded-none border-2 border-neutral-800 bg-black/55">
          <CardHeader className="border-b border-neutral-800">
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="text-blue-500" />
              Payment readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge className="rounded-none bg-blue-700 font-mono uppercase">
                  {readiness.replaceAll("_", " ")}
                </Badge>
                <p className="mt-3 text-sm text-neutral-400">
                  {ready
                    ? "Ready to authorize payment when accepting a Vouch."
                    : "Setup is required before you can accept and authorize a Vouch."}
                </p>
              </div>
              <div className="flex gap-3">
                {startAction ? (
                  <PaymentMethodSetupForm
                    publishableKey={publishableKey}
                    ready={ready}
                    startAction={startAction}
                  />
                ) : null}
                {refreshAction ? (
                  <form action={refreshAction}>
                    <Button type="submit" variant="outline" className="h-11 rounded-none px-5">
                      <RotateCw />
                      Refresh
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-2 border-neutral-800 bg-neutral-950/65">
          <CardContent className="grid gap-4 py-5">
            <CheckLine icon={LockKeyhole} text="No card numbers are collected in Vouch UI." />
            <CheckLine icon={ShieldAlert} text="Provider status is reconciled server-side." />
            <CheckLine
              icon={CheckCircle2}
              text="A ready payment method unlocks customer acceptance."
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function CheckLine({ icon: Icon, text }: { icon: typeof LockKeyhole; text: string }) {
  return (
    <div className="flex gap-3 border border-neutral-800 bg-black/40 p-3">
      <Icon className="mt-0.5 text-blue-500" />
      <p className="text-sm text-neutral-300">{text}</p>
    </div>
  )
}

export default PaymentSettingsPage
