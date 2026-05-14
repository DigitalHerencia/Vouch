import Link from "next/link"
import { ArrowUpRight, FileCheck2, Plus, ShieldCheck } from "lucide-react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { vouchPageCopy } from "@/content/vouches"

export type VouchListItem = {
  id: string
  href: string
  title: string
  statusLabel: string
  roleLabel: string
  amountLabel: string
  deadlineLabel: string
  nextActionLabel?: string
}

type VouchListPageProps = { title?: string; items: VouchListItem[] }

export function VouchListPage({ title = vouchPageCopy.list.defaultTitle, items }: VouchListPageProps) {
  const copy = vouchPageCopy.list

  return (
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={title}
          body={copy.body}
        />
        <Button className="h-11 px-5" render={<Link href="/vouches/new" />}>
          <Plus />
          {copy.create}
        </Button>
      </div>
      {items.length === 0 ? (
        <CalloutPanel
          icon={FileCheck2}
          title={copy.emptyTitle}
          body={copy.emptyBody}
          actions={
            <div className="grid gap-3 border border-neutral-800 bg-neutral-950/70 p-4">
              <Badge className="w-fit rounded-none bg-primary font-mono uppercase text-primary-foreground">{copy.nextAction}</Badge>
              <p className="max-w-80 text-sm text-neutral-300">
                {copy.emptyActionBody}
              </p>
              <Button render={<Link href="/vouches/new" />}>
                {copy.create}
                <ArrowUpRight />
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Surface key={item.id} variant="muted">
              <SurfaceHeader>
                <h2 className="flex items-center gap-3 text-[18px] leading-none text-white">
                  <ShieldCheck className="text-primary" />
                  {item.statusLabel}
                </h2>
              </SurfaceHeader>
              <SurfaceBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-1">
                  <Link href={item.href} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-sm text-neutral-400">
                    {item.roleLabel} · {item.statusLabel} · {item.deadlineLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{item.amountLabel}</span>
                  {item.nextActionLabel ? (
                    <Button size="sm" render={<Link href={item.href} />}>
                      {item.nextActionLabel}
                    </Button>
                  ) : null}
                </div>
              </SurfaceBody>
            </Surface>
          ))}
        </div>
      )}
    </main>
  )
}
