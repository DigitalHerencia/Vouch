"use client"

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function CreateVouchForm() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="border border-neutral-800 bg-neutral-950/60">
        <Step number="1" title="Amount">
          <label className="text-sm text-neutral-200">Amount (USD)</label>
          <Input className="mt-2 h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono text-lg" defaultValue="$ 200.00" />
          <p className="mt-2 font-mono text-xs text-neutral-500">Minimum $10.00</p>
        </Step>
        <Step number="2" title="Meeting window">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input className="rounded-none border-neutral-800 bg-neutral-950" defaultValue="May 24, 2025" />
            <Input className="rounded-none border-neutral-800 bg-neutral-950" defaultValue="04:00 PM" />
            <Input className="rounded-none border-neutral-800 bg-neutral-950" defaultValue="May 24, 2025" />
            <Input className="rounded-none border-neutral-800 bg-neutral-950" defaultValue="06:00 PM" />
          </div>
          <p className="mt-2 font-mono text-xs text-neutral-500">Window length: 2h 00m</p>
        </Step>
        <Step number="3" title="Recipient">
          <Input className="rounded-none border-neutral-800 bg-neutral-950" placeholder="email@example.com" />
          <div className="mt-4 flex items-center justify-between">
            <span>
              <strong className="block text-sm">Shareable link</strong>
              <span className="text-sm text-neutral-500">Anyone with the link can view and accept this Vouch.</span>
            </span>
            <Switch defaultChecked />
          </div>
        </Step>
        <Step number="4" title="Details (optional)">
          <Input className="rounded-none border-neutral-800 bg-neutral-950" placeholder="e.g. Consulting call" />
          <Textarea className="mt-3 rounded-none border-neutral-800 bg-neutral-950" placeholder="Add any internal notes..." />
        </Step>
      </section>

      <aside className="grid gap-4">
        <div className="border border-neutral-800 bg-neutral-950/70 p-5">
          <h2 className="text-xl font-bold text-white">Summary</h2>
          <Line label="Vouch amount" value="$200.00" />
          <Line label="Platform fee (2.5% + $1.00)" value="$6.00" />
          <div className="mt-4 border-t border-neutral-800 pt-4">
            <Line label="Total commitment" value="$206.00" strong />
          </div>
        </div>
        <div className="border border-neutral-800 bg-neutral-950/70 p-5">
          <ShieldCheck className="mb-3 size-8 text-blue-500" />
          <h2 className="font-bold text-white">The rule is simple</h2>
          <p className="mt-2 text-sm text-neutral-400">Both parties confirm within the window. If both do not confirm, payment is refunded or not captured.</p>
        </div>
        <div className="border border-neutral-800 bg-neutral-950/70 p-5">
          <LockKeyhole className="mb-3 size-8 text-neutral-400" />
          <h2 className="font-bold text-white">Secure and neutral</h2>
          <p className="mt-2 text-sm text-neutral-400">Payments are processed by Stripe. Vouch does not hold funds or judge outcomes.</p>
        </div>
        <Button className="h-12 rounded-none bg-blue-700">
          Review & commit <ArrowRight className="ml-auto size-5" />
        </Button>
      </aside>
    </div>
  )
}

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-neutral-800 p-5 last:border-b-0">
      <h2 className="mb-4 flex items-center gap-4 font-bold text-white">
        <span className="font-mono text-blue-500">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mt-3 flex justify-between gap-4 font-mono text-sm">
      <span className={strong ? "text-white" : "text-neutral-300"}>{label}</span>
      <span className={strong ? "text-blue-500" : "text-white"}>{value}</span>
    </div>
  )
}

export default CreateVouchForm
