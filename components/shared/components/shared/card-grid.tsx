// components/shared/card-grid.tsx

import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export interface CardGridItem {
  title: string
  body: string
  icon?: LucideIcon
  href?: string
  actionLabel?: string
}

export interface CardGridProps {
  items: CardGridItem[]
  className?: string | undefined
  cardClassName?: string | undefined
}

export function CardGrid({ items, className, cardClassName }: CardGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <CardGridTile key={item.title} item={item} className={cardClassName} />
      ))}
    </div>
  )
}

export function CardGridTile({
  item,
  className,
}: {
  item: CardGridItem
  className?: string | undefined
}) {
  const Icon = item.icon

  const tileClassName = cn(
    "min-h-52.5 border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px]",
    item.href
      ? "hover:border-primary transition-all duration-[160ms] hover:-translate-y-px"
      : undefined,
    className
  )

  const content = (
    <>
      {Icon ? <Icon className="size-9 text-white" strokeWidth={1.7} /> : null}

      <h3
        className={cn(
          "font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase",
          Icon ? "mt-8" : undefined
        )}
      >
        {item.title}
      </h3>

      <p className="mt-4 text-[15px] leading-[1.28] font-semibold text-neutral-400">{item.body}</p>

      {item.actionLabel ? (
        <p className="text-primary mt-6 font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] uppercase">
          {item.actionLabel}
        </p>
      ) : null}
    </>
  )

  if (item.href) {
    return (
      <Link href={item.href} className={tileClassName}>
        {content}
      </Link>
    )
  }

  return <article className={tileClassName}>{content}</article>
}

export { CardGrid as BrutalistCardGrid }
