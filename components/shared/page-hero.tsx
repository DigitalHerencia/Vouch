import type { ReactNode } from "react"

export interface PageHeroProps {
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
}

export function PageHero({ title, body, actions }: PageHeroProps) {
  return (
    <section className="flex w-full flex-col items-center space-y-8">
      <h1 className="tracking-loose leading-tight font-black text-white">{title}</h1>

      {body ? (
        <p className="leadind-tight font-semibold tracking-normal text-neutral-200">{body}</p>
      ) : null}

      {actions ? (
        <div className="mt-6 flex flex-col justify-items-start gap-4 md:mt-8 md:flex-row">
          {actions}
        </div>
      ) : null}
    </section>
  )
}
