import type { VouchFormPageTitleProps } from "@/types/vouchTypes"

export function PageTitle({
  eyebrow,
  title,
  description,
  variant = "hero",
}: VouchFormPageTitleProps) {
  const isPage = variant === "page"

  return (
    <header className="grid gap-3">
      {eyebrow ? (
        <p className="w-fit border border-neutral-600 bg-black px-3 py-1 text-[11px] leading-none font-black tracking-[0.2em] text-blue-600 uppercase">
          {eyebrow}
        </p>
      ) : null}

      <div className="grid gap-2">
        <h1
          id="vouch-title"
          className={[
            "max-w-4xl leading-none font-black tracking-tight text-white uppercase",
            isPage ? "text-2xl md:text-3xl" : "text-5xl md:text-7xl lg:text-8xl",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </h1>

        {description ? (
          <p className="max-w-3xl text-sm leading-6 font-semibold text-neutral-300">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  )
}
