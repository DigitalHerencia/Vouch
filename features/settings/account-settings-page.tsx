import Link from "next/link"
import { ArrowUpRight, CreditCard, Landmark, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AccountSettingsPage() {
  const rows = [
    { href: "/settings/verification", title: "Verification", body: "Identity and 18+ readiness.", icon: ShieldCheck },
    { href: "/settings/payment", title: "Payment method", body: "Used when you create Vouches.", icon: CreditCard },
    { href: "/settings/payout", title: "Payout account", body: "Used when you receive funds.", icon: Landmark },
    { href: "/legal/terms", title: "Terms", body: "Review product terms and payment coordination rules.", icon: LockKeyhole },
  ]

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5">
      <div>
        <p className="vouch-label text-blue-500">Private account</p>
        <h1 className="mt-3 font-heading text-5xl text-white sm:text-6xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">Manage readiness for commitment-backed payments. These are private setup surfaces, not public profile fields.</p>
      </div>
      <Card className="rounded-none border-2 border-neutral-800 bg-black/55">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="flex items-center gap-3">
            <UserRound className="text-blue-500" />
            Profile basics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 py-5 text-sm text-neutral-400 sm:grid-cols-2">
          <div className="border border-neutral-800 bg-neutral-950/70 p-4">
            <strong className="block text-white">Account</strong>
            Managed by Clerk authentication.
          </div>
          <div className="border border-neutral-800 bg-neutral-950/70 p-4">
            <strong className="block text-white">Security</strong>
            Use Clerk settings to manage sign-in methods.
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <Card key={row.href} className="rounded-none border-2 border-neutral-800 bg-neutral-950/65 transition hover:border-blue-700/80 hover:bg-black/70">
              <CardContent className="flex min-h-36 items-center justify-between gap-4 py-5">
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
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}

export default AccountSettingsPage
