import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface CardGridItem { title: string; body: string; icon?: LucideIcon; href?: string; actionLabel?: string }

export function CardGrid({ items, className, cardClassName }: { items: CardGridItem[]; className?: string | undefined; cardClassName?: string | undefined | undefined }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{items.map((item) => <CardGridTile key={item.title} item={item} className={cardClassName} />)}</div>
}

function CardGridTile({ item, className }: { item: CardGridItem; className?: string | undefined }) {
  const Icon = item.icon
  const content = (
    <Card className={cn("min-h-52 rounded-none border-neutral-800 bg-black", className)}>
      <CardContent>
        {Icon ? <Icon className="size-9 text-white" strokeWidth={1.7} /> : null}
        <CardTitle className={cn("text-3xl", Icon ? "mt-8" : undefined)}>{item.title}</CardTitle>
        <CardDescription className="mt-4 text-sm font-semibold leading-6">{item.body}</CardDescription>
        {item.actionLabel ? <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">{item.actionLabel}</p> : null}
      </CardContent>
    </Card>
  )
  return item.href ? <Link href={item.href}>{content}</Link> : content
}