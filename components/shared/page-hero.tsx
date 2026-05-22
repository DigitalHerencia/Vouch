export function PageHero({
  title,
  body,
  actions,
}: {
  title: string
  body: string
  actions?: React.ReactNode
}) {
  return (
    <div className="grid gap-6">
      <h1 className="font-(family-name:--font-display) text-5xl leading-none font-black tracking-wide text-white uppercase sm:text-6xl lg:text-7xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-7 font-semibold text-neutral-400 sm:text-lg">
        {body}
      </p>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </div>
  )
}
