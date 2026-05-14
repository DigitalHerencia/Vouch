import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface ShellProps {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
  mobileBottomNav?: ReactNode
  className?: string | undefined
  mainClassName?: string | undefined
}

export function Shell({
  children,
  header,
  footer,
  mobileBottomNav,
  className,
  mainClassName,
}: ShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent text-white", className)}>
      {header}
      <main className={cn("w-full pb-24 md:pb-0", mainClassName)}>{children}</main>
      {footer}
      {mobileBottomNav}
    </div>
  )
}
