const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingWordMotion =
  "block w-fit transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"

export function HeroWithStats({
  subtitle,
  title,
  titleHighlight,
  description,
  stats,
  align = "center",
}: HeroWithStatsProps) {
  const isLeftAligned = align === "left"

  return (
    <section>
      <div className={`mb-12 space-y-8 ${isLeftAligned ? "text-left" : "text-center"}`}>
        {subtitle ? (
          <p
            className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion} ${isLeftAligned ? "" : "mx-auto"}`}
          >
            {subtitle}
          </p>
        ) : null}

        <h2
          className={`group flex flex-wrap gap-x-4 leading-tight font-black uppercase ${
            isLeftAligned ? "justify-start" : "justify-center"
          }`}
        >
          {title.split(" ").map((word, i) => (
            <span
              key={`${word}-${i}`}
              className={headingWordMotion}
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              {word}
            </span>
          ))}
          {titleHighlight ? (
            <span className="border-3 border-neutral-200 bg-blue-600 px-2 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[10px_10px_0px_oklch(54.6%_0.245_262.881)]">
              {titleHighlight}
            </span>
          ) : null}
        </h2>

        <p
          className={`max-w-4xl text-lg font-medium text-neutral-400 md:text-xl ${bodyTextMotion} ${isLeftAligned ? "" : "mx-auto"}`}
        >
          {description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={`stat-${stat.label}`}
            className="border-3 border-neutral-400 bg-black p-6 text-left shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"
          >
            <div className="flex items-center gap-2 border-b-3 border-neutral-400 pb-3">
              <div className="border-2 border-neutral-400 px-4 py-2 text-3xl font-black text-white md:text-4xl">
                {stat.value}
              </div>
              <div className="text-lg leading-tight font-bold text-blue-600 uppercase">
                {stat.label}
              </div>
            </div>
            {stat.body ? <p className="mt-3 text-sm font-medium text-white">{stat.body}</p> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
