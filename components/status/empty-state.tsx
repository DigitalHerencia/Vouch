// components/feedback/empty-state.tsx

import type { ReactNode } from "react"

export interface EmptyStateProps {
  eyebrow?: ReactNode | undefined
  title: ReactNode
  body?: ReactNode | undefined
  actions?: ReactNode | undefined
}

export function EmptyState({ eyebrow = "Empty", title, body, actions }: EmptyStateProps) {
  return (
    <section className="border border-neutral-400 bg-black p-6 backdrop-blur-[2px] sm:p-8">
      <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-blue-600 uppercase">
        {eyebrow}
      </p>

      <h2 className="mt-4 font-(family-name:--font-display) text-[42px] leading-[0.92] tracking-[0.02em] text-white uppercase sm:text-[56px]">
        {title}
      </h2>

      {body ? (
        <p className="mt-5 max-w-160 text-[16px] leading-[1.4] font-semibold text-neutral-400">
          {body}
        </p>
      ) : null}

      {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </section>
  )
}
