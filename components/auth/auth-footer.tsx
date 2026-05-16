// components/auth/auth-footer.tsx

import type { ReactNode } from "react"

type AuthFooterProps = Readonly<{
  eyebrow: string
  children: ReactNode
}>

export function AuthFooter({ eyebrow, children }: AuthFooterProps) {
  return (
    <footer className="border-t border-neutral-900 px-6 py-4 sm:px-10 lg:px-14">
      <p className="font-mono text-[11px] leading-5 text-neutral-500 sm:text-xs">
        <span className="font-bold text-blue-500">{eyebrow}</span>

        <span className="mx-2 text-neutral-700">/</span>

        {children}
      </p>
    </footer>
  )
}
