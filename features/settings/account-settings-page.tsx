import Link from "next/link"
import { ArrowUpRight, CreditCard, Landmark, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"

export function AccountSettingsPage() {
  const rows = [
    { href: "/settings/verification", title: "Verification", body: "Identity and 18+ readiness.", icon: ShieldCheck },
    { href: "/settings/payment", title: "Payment method", body: "Used when you create Vouches.", icon: CreditCard },
    { href: "/settings/payout", title: "Payout account", body: "Used when you receive funds.", icon: Landmark },
    { href: "/legal/terms", title: "Terms", body: "Review product terms and payment coordination rules.", icon: LockKeyhole },
  ]

  return (
    <main className="grid w-full gap-6">
      <SectionIntro
        eyebrow="Private account"
        title="Settings"
        body="Manage readiness for commitment-backed payments. These are private setup surfaces, not public profile fields."
      />

      <Surface>
        <SurfaceHeader>
          <h2 className="flex items-center gap-3 font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
            <UserRound className="text-blue-500" />
            Profile basics
          </h2>
        </SurfaceHeader>
        <SurfaceBody className="grid gap-4 text-sm text-neutral-400 sm:grid-cols-2">
          <div className="border border-neutral-800 bg-neutral-950/70 p-4">
            <strong className="block text-white">Account</strong>
            Managed by Clerk authentication.
          </div>
          <div className="border border-neutral-800 bg-neutral-950/70 p-4">
            <strong className="block text-white">Security</strong>
            Use Clerk settings to manage sign-in methods.
          </div>
        </SurfaceBody>
      </Surface>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <Surface
              key={row.href}
              className="transition hover:border-blue-700/80 hover:bg-black/70"
              padding="md"
              variant="muted"
            >
              <div className="flex min-h-28 items-center justify-between gap-4">
                <div className="flex gap-4">
                  <span className="grid size-12 place-items-center border border-blue-900 bg-blue-950/30">
                    <Icon className="text-blue-500" />
                  </span>
                  <span>
                    <strong className="block text-lg text-white">{row.title}</strong>
                    <span className="mt-1 block text-sm text-neutral-400">{row.body}</span>
                  </span>
                </div>
                <Button variant="outline" size="icon" className="rounded-none" render={<Link href={row.href} />}>
                  <ArrowUpRight />
                  <span className="sr-only">Open {row.title}</span>
                </Button>
              </div>
            </Surface>
          )
        })}
      </div>
    </main>
  )
}

export default AccountSettingsPage
