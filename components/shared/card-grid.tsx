import type { LucideIcon } from "lucide-react"

export function CardGrid({
  items,
}: {
  items: readonly { title: string; body: string; icon?: LucideIcon }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article key={item.title} className="border-3 border-neutral-400 bg-black p-5">
            {Icon ? (
              <div className="mb-4 flex size-11 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-white">
                <Icon className="size-5" />
              </div>
            ) : null}
            <h3 className="text-lg font-black text-white uppercase">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 font-semibold text-neutral-400">{item.body}</p>
          </article>
        )
      })}
    </div>
  )
}
