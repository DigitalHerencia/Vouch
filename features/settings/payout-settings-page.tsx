import { Banknote, CheckCircle2, Landmark, LockKeyhole, RotateCw } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type PayoutSettingsPageProps = {
  state?: { variant?: string; readiness?: { readiness?: string | null } | null }
  startAction?: (formData: FormData) => void | Promise<void>
  refreshAction?: (formData: FormData) => void | Promise<void>
}

export function PayoutSettingsPage({ state, startAction, refreshAction }: PayoutSettingsPageProps) {
  const readiness = state?.readiness?.readiness ?? "not_started"
  const ready = readiness === "ready"
  return (
    <section className="grid w-full gap-6">
      <SectionIntro
        eyebrow="Merchant setup"
        title="Payout account"
        body="Complete Stripe Connect onboarding before creating Vouches that may release funds."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <Surface>
          <SurfaceHeader>
            <h2 className="flex items-center gap-3 font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              <Landmark className="text-blue-500" />
              Connect readiness
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge className="rounded-none bg-blue-700 font-mono uppercase">
                  {readiness.replaceAll("_", " ")}
                </Badge>
                <p className="mt-3 text-sm text-neutral-400">
                  {ready
                    ? "Ready to receive released funds after both parties confirm."
                    : "Hosted onboarding is required before merchant creation is ready."}
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
          </SurfaceBody>
        </Surface>
        <Surface variant="muted" padding="md">
          <div className="grid gap-4">
            <CheckLine icon={LockKeyhole} text="Bank details are handled by Stripe Connect." />
            <CheckLine icon={CheckCircle2} text="Ready status is required for merchant creation." />
            <CheckLine icon={Landmark} text="Restricted accounts must finish hosted onboarding." />
          </div>
        </Surface>
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
