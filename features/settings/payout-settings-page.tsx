import { Banknote, CheckCircle2, Landmark, LockKeyhole, RotateCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PayoutSettingsPageProps = {
  state?: { variant?: string; readiness?: { readiness?: string | null } | null }
  startAction?: (formData: FormData) => void | Promise<void>
  refreshAction?: (formData: FormData) => void | Promise<void>
}

export function PayoutSettingsPage({ state, startAction, refreshAction }: PayoutSettingsPageProps) {
  const readiness = state?.readiness?.readiness ?? "not_started"
  const ready = readiness === "ready"
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5">
      <div>
        <p className="vouch-label text-blue-500">Payee setup</p>
        <h1 className="mt-3 font-heading text-5xl text-white sm:text-6xl">Payout account</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Complete Stripe Connect onboarding before accepting Vouches that may release funds.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <Card className="rounded-none border-2 border-neutral-800 bg-black/55">
          <CardHeader className="border-b border-neutral-800">
            <CardTitle className="flex items-center gap-3">
              <Landmark className="text-blue-500" />
              Connect readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge className="rounded-none bg-blue-700 font-mono uppercase">{readiness.replaceAll("_", " ")}</Badge>
                <p className="mt-3 text-sm text-neutral-400">
                  {ready
                    ? "Ready to receive released funds after both parties confirm."
                    : "Hosted onboarding is required before payee acceptance is ready."}
                </p>
              </div>
              <div className="flex gap-3">
                {startAction ? (
                  <form action={startAction}>
                    <Button type="submit" className="h-11 rounded-none bg-blue-700 px-5">
                      <Banknote />
                      {ready ? "Open onboarding" : "Start onboarding"}
                    </Button>
                  </form>
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
            <CheckLine icon={LockKeyhole} text="Bank details are handled by Stripe Connect." />
            <CheckLine icon={CheckCircle2} text="Ready status is required for payee acceptance." />
            <CheckLine icon={Landmark} text="Restricted accounts must finish hosted onboarding." />
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

export default PayoutSettingsPage
