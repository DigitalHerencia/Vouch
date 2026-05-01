export interface BrutalistPageHeaderProps {
  eyebrow: string
  title: string
  body: string
}

export function BrutalistPageHeader({ eyebrow, title, body }: BrutalistPageHeaderProps) {
  return (
    <header className="max-w-225">
      <div className="flex items-center gap-3">
        <span className="size-3 bg-[#1D4ED8]" />
        <p className="font-(family-name:--font-display) text-[15px] tracking-[0.08em] text-white uppercase">
          {eyebrow}
        </p>
      </div>

      <h1 className="mt-6 font-(family-name:--font-display) text-[62px] leading-[0.88] tracking-[0.015em] text-white uppercase sm:text-[86px] lg:text-[104px]">
        {title}
      </h1>

      <p className="mt-5 max-w-170 text-[18px] leading-[1.35] font-semibold text-neutral-400">
        {body}
      </p>
    </header>
  )
}
