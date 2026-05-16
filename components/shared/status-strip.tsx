import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface StatusStripItem {
  label: ReactNode
  value: ReactNode
  body?: ReactNode
}

export interface StatusStripProps {
  items: StatusStripItem[]
  className?: string
}

export function StatusStrip({ items, className }: StatusStripProps) {
  return (
    <section
      className={cn(
        "grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
        items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => (
        <article
          key={`${item.label}-${index}`}
          className="min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
        >
          <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.07em] text-white uppercase">
            {item.label}
          </p>
          <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
            {item.value}
          </p>
          {item.body ? (
            <p className="mt-3 max-w-52.5 text-[15px] leading-[1.22] font-semibold text-neutral-300">
              {item.body}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  )
}
