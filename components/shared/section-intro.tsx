export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string
  title: string
  body: string
}) {
  return (
    <header className="grid max-w-3xl gap-3">
      {eyebrow ? (
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl leading-none font-black tracking-wide text-white uppercase sm:text-5xl">
        {title}
      </h2>
      <p className="text-sm leading-6 font-semibold text-neutral-400 sm:text-base">{body}</p>
    </header>
  )
}
