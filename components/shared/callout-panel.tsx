import type { LucideIcon } from "lucide-react"

export function CalloutPanel({
  id,
  icon: Icon,
  title,
  body,
  actions,
}: {
  id?: string
  icon?: LucideIcon
  title: string
  body: string
  actions?: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0_#1D4ED8]"
    >
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        {Icon ? (
          <div className="flex size-14 items-center justify-center border-2 border-neutral-400 bg-blue-600">
            <Icon className="size-7 text-white" />
          </div>
        ) : null}
        <div>
          <h2 className="text-2xl leading-tight font-black text-white uppercase">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 font-semibold text-neutral-400">{body}</p>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
    </section>
  )
}
