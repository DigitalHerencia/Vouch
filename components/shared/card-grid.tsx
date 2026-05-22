import type { LucideIcon } from "lucide-react"
import Link from "next/link"

export interface CardGridItem {
  title: string
  body: string
  icon?: LucideIcon | undefined
  href?: string | undefined
  actionLabel?: string | undefined
}

export interface CardGridProps {
  items: readonly CardGridItem[]
}

export function CardGrid({ items }: CardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <CardGridTile key={item.title} item={item} />
      ))}
    </div>
  )
}

export function CardGridTile({ item }: { item: CardGridItem }) {
  const Icon = item.icon

  const tileClassName = item.href
    ? "min-h-52.5 border border-neutral-400 bg-black p-6 backdrop-blur-[2px] transition-all duration-[160ms] hover:-translate-y-px hover:border-blue-600"
    : "min-h-52.5 border border-neutral-400 bg-black p-6 backdrop-blur-[2px]"

  const content = (
    <>
      {Icon ? <Icon className="size-9 text-white" strokeWidth={1.7} /> : null}

      <h3
        className={
          Icon
            ? "mt-8 font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase"
            : "font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase"
        }
      >
        {item.title}
      </h3>

      <p className="mt-4 text-[15px] leading-[1.28] font-semibold text-neutral-400">{item.body}</p>

      {item.actionLabel ? (
        <p className="mt-6 font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-blue-600 uppercase">
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
