import Link from "next/link"
import { CreditCard, Landmark, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"

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
    <main className="mx-auto grid w-full max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-5xl text-white">Settings</h1>
        <p className="mt-2 text-neutral-400">Manage account readiness for commitment-backed payments.</p>
      </div>
      <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
        <CardHeader><CardTitle className="flex items-center gap-3"><UserRound className="text-blue-500" />Profile basics</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-2">
          <p><strong className="block text-white">Account</strong>Managed by Clerk authentication.</p>
          <p><strong className="block text-white">Security</strong>Use Clerk settings to manage sign-in methods.</p>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <Card key={row.href} className="rounded-none border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="flex gap-4">
                  <Icon className="size-7 text-blue-500" />
                  <span><strong className="block text-white">{row.title}</strong><span className="text-sm text-neutral-400">{row.body}</span></span>
                </div>
                <Button variant="outline" className="rounded-none" render={<Link href={row.href} />}>Open</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}

export default AccountSettingsPage
