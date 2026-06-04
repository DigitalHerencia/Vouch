import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type AuthNavLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export function AuthNavLink({ href, children, className }: AuthNavLinkProps) {
  return (
    <Button asChild variant="nav" size="nav" className={className}>
      <Link href={href} target="_blank" rel="noreferrer">
        {children}
      </Link>
    </Button>
  )
}
