import type { ReactNode } from "react"

export interface SectionIntroProps {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  panel?: boolean
}

export function SectionIntro({ eyebrow, title, body, actions }: SectionIntroProps) {
  return (
    <section className="max-w-7xl.5">
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-blue-600" />
          <p className="vouch-label text-[15px] leading-none text-white">{eyebrow}</p>
        </div>
      ) : null}

      <h2
        className={
          eyebrow
            ? "mt-6 max-w-7xl text-[48px] leading-[0.92] text-white sm:text-[64px]"
            : "max-w-7xl text-[48px] leading-[0.92] text-white sm:text-[64px]"
        }
      >
        {title}
      </h2>

      {body ? (
        <p className="mt-4 max-w-7xl text-[17px] leading-[1.35] font-semibold text-neutral-400">
          {body}
        </p>
      ) : null}

      {actions ? <div className="mt-8 flex flex-col gap-4 sm:flex-row">{actions}</div> : null}
    </section>
  )
}
