import { Copy, Info, Mail, Share2 } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { vouchPageCopy } from "@/content/vouches"

export function ShareVouchPanel() {
  const copy = vouchPageCopy.share

  return (
    <main className="grid w-full gap-8 lg:grid-cols-[1fr_0.85fr]">
      <section>
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body}
        />
        <Surface className="mt-8" variant="muted">
          <SurfaceBody className="grid gap-6">
            <div className="flex gap-4"><Share2 className="size-8 text-primary" /><span><strong className="block text-white">{copy.inviteLinkTitle}</strong><span className="text-sm text-neutral-400">{copy.inviteLinkBody}</span></span></div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input readOnly value={copy.inviteUrl} className="h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono" />
              <Button className="h-12"><Copy className="mr-2 size-4" />{copy.copyLink}</Button>
            </div>
            <div className="border-t border-neutral-800 pt-5">
              <div className="flex gap-4"><Mail className="size-8 text-primary" /><span><strong className="block text-white">{copy.sendInvitationTitle}</strong><span className="text-sm text-neutral-400">{copy.sendInvitationBody}</span></span></div>
              <Input className="mt-4 h-12 rounded-none border-neutral-800 bg-neutral-950" placeholder={copy.emailPlaceholder} />
              <Button className="mt-4 h-12 w-full">{copy.sendInvitation}</Button>
            </div>
          </SurfaceBody>
        </Surface>
      </section>
      <Surface className="lg:mt-20" variant="muted">
        <SurfaceHeader>
          <h2 className="flex items-center justify-between text-[26px] leading-none text-white">
            {copy.summaryTitle} <Badge className="rounded-none border-amber-700 bg-amber-950 text-amber-400">{copy.pending}</Badge>
          </h2>
        </SurfaceHeader>
        <SurfaceBody className="space-y-4">
          <p className="font-mono text-4xl text-white">$200.00 <span className="text-sm text-neutral-400">{copy.amountCurrency}</span></p>
          {copy.summaryRows.map(([label, value]) => <Line key={label} label={label} value={value} />)}
          <p className="border border-neutral-800 p-4 text-sm text-neutral-400"><Info className="mr-2 inline size-4 text-primary" />{copy.rule}</p>
        </SurfaceBody>
      </Surface>
    </main>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-neutral-800 pb-3 text-sm"><span className="text-neutral-400">{label}</span><span className="font-mono text-white">{value}</span></div>
}

export default ShareVouchPanel
