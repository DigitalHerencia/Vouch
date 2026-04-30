import { Copy, Info, Mail, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ShareVouchPanel() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr]">
      <section>
        <Link href="/vouches" className="text-sm text-blue-500">← Back to vouch</Link>
        <h1 className="mt-7 font-heading text-5xl text-white">Share this Vouch</h1>
        <p className="mt-3 max-w-lg text-neutral-400">Invite the other party to accept this commitment. They&apos;ll need to sign in or create an account.</p>
        <Card className="mt-8 rounded-none border-neutral-800 bg-neutral-900/50">
          <CardContent className="grid gap-6 py-5">
            <div className="flex gap-4"><Share2 className="size-8 text-blue-500" /><span><strong className="block text-white">Invite link</strong><span className="text-sm text-neutral-400">Anyone with this link can view and accept this Vouch.</span></span></div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input readOnly value="https://vouch.com/invite/abc123xyz789" className="h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono" />
              <Button className="h-12 rounded-none bg-blue-700"><Copy className="mr-2 size-4" />Copy link</Button>
            </div>
            <div className="border-t border-neutral-800 pt-5">
              <div className="flex gap-4"><Mail className="size-8 text-blue-500" /><span><strong className="block text-white">Send invitation</strong><span className="text-sm text-neutral-400">Send an email invitation directly.</span></span></div>
              <Input className="mt-4 h-12 rounded-none border-neutral-800 bg-neutral-950" placeholder="email@example.com" />
              <Button className="mt-4 h-12 w-full rounded-none bg-blue-700">Send invitation</Button>
            </div>
            <div className="grid gap-3 border-t border-neutral-800 pt-5 sm:grid-cols-2">
              <Button variant="outline" className="h-14 rounded-none justify-start"><MessageSquare className="mr-2 size-5" />Share via SMS</Button>
              <Button variant="outline" className="h-14 rounded-none justify-start"><Share2 className="mr-2 size-5" />Other share methods</Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <Card className="rounded-none border-neutral-800 bg-neutral-900/50 lg:mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">Vouch summary <Badge className="rounded-none border-amber-700 bg-amber-950 text-amber-400">Pending</Badge></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-mono text-4xl text-white">$200.00 <span className="text-sm text-neutral-400">USD</span></p>
          <Line label="From" value="jordan@client.com" />
          <Line label="For" value="you" />
          <Line label="Label" value="Consulting call" />
          <Line label="Meeting window" value="May 24, 2025 · 4:00 PM - 6:00 PM" />
          <p className="border border-neutral-800 p-4 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-blue-500" />Funds release only after both parties confirm presence within the window.</p>
        </CardContent>
      </Card>
    </main>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-neutral-800 pb-3 text-sm"><span className="text-neutral-400">{label}</span><span className="font-mono text-white">{value}</span></div>
}

export default ShareVouchPanel
