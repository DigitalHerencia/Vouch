// components/auth/auth-header.tsx

import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { authHeaderContent } from "@/content/auth"

export function AuthHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14">
      <Link
        href={authHeaderContent.homeHref}
        aria-label={authHeaderContent.homeAriaLabel}
        className="inline-flex min-w-0"
      >
        <LogoLockup />
      </Link>

      <Link
        href={authHeaderContent.homeHref}
        className="font-(family-name:--font-display) text-xs leading-none tracking-widest text-neutral-500 uppercase underline-offset-4 transition-colors hover:text-blue-500 hover:underline sm:text-sm"
      >
        {authHeaderContent.homeLabel}
      </Link>
    </header>
  )
}
