import { CheckCircle2, Clock, IdCard, RotateCw, ShieldCheck } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type VerificationSettingsPageProps = {
  status?: { identityStatus?: string; adultStatus?: string } | null
  startIdentityAction?: (formData: FormData) => void | Promise<void>
  reconcileAction?: (formData: FormData) => void | Promise<void>
}

export function VerificationSettingsPage({
  status,
  startIdentityAction,
  reconcileAction,
}: VerificationSettingsPageProps) {
  const identity = status?.identityStatus ?? "unstarted"
  const adult = status?.adultStatus ?? "unstarted"
  const verified = identity === "verified" && adult === "verified"

  return (
    <section className="grid w-full gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <SectionIntro
          eyebrow="Account readiness"
          title="Verification"
          body="Confirm identity and adult eligibility before payment-backed flows. Verification uses a provider-secure flow; Vouch does not store raw identity documents."
        />
        <ActionForms
          startIdentityAction={startIdentityAction}
          reconcileAction={reconcileAction}
          primaryLabel={verified ? "Verified" : "Start verification"}
        />
      </div>

      <Surface padding="md">
        <div className="grid gap-4 md:grid-cols-3">
          <StatusTile icon={IdCard} title="Identity" status={identity} />
          <StatusTile icon={ShieldCheck} title="Adult eligibility" status={adult} />
          <StatusTile
            icon={verified ? CheckCircle2 : Clock}
            title="Create / accept gate"
            status={verified ? "ready" : "requires_action"}
          />
        </div>
      </Surface>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Requirements
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-4">
            {[
              "Use the provider-hosted identity check.",
              "Confirm adult eligibility for payment-bearing participation.",
              "Return here and refresh status after the provider flow completes.",
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 text-blue-500" />
                <p className="text-sm text-neutral-300">{item}</p>
              </div>
            ))}
          </SurfaceBody>
        </Surface>
        <Surface className="border-blue-900/70 bg-blue-950/20">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Operational note
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-4">
            <p className="text-sm text-neutral-300">
              Rejected, expired, or requires-action states do not release funds. Complete the
              secure provider flow and refresh before creating or accepting Vouches.
            </p>
            <Separator />
            <p className="font-mono text-xs text-neutral-500">
              Current state: identity={identity}; adult={adult}
            </p>
          </SurfaceBody>
        </Surface>
      </div>
    </section>
  )
}

function StatusTile({
  icon: Icon,
  title,
  status,
}: {
  icon: typeof IdCard
  title: string
  status: string
}) {
  const ready = status === "verified" || status === "ready"
  const failed = status === "rejected" || status === "expired" || status === "failed"
  return (
    <div className="border border-neutral-800 bg-black/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <Icon className={ready ? "text-green-500" : failed ? "text-amber-500" : "text-blue-500"} />
        <Badge variant="outline" className="rounded-none border-neutral-700 font-mono text-xs uppercase">
          {status.replaceAll("_", " ")}
        </Badge>
      </div>
      <h2 className="mt-5 text-2xl">{title}</h2>
    </div>
  )
}

function ActionForms({
  startIdentityAction,
  reconcileAction,
  primaryLabel,
}: {
  startIdentityAction?: ((formData: FormData) => void | Promise<void>) | undefined
  reconcileAction?: ((formData: FormData) => void | Promise<void>) | undefined
  primaryLabel: string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
      {startIdentityAction ? (
        <form action={startIdentityAction}>
          <Button type="submit" className="h-11 w-full rounded-none bg-blue-700 px-5 sm:w-auto" disabled={primaryLabel === "Verified"}>
            <IdCard />
            {primaryLabel}
          </Button>
        </form>
      ) : null}
      {reconcileAction ? (
        <form action={reconcileAction}>
          <Button type="submit" variant="outline" className="h-11 w-full rounded-none px-5 sm:w-auto">
            <RotateCw />
            Refresh
          </Button>
        </form>
      ) : null}
    </div>
  )
}

export default VerificationSettingsPage
