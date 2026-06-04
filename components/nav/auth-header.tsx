// components/auth/auth-header.tsx

import Link from "next/link"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { authHeaderContent } from "@/content/auth"

export function AuthHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-6 md:px-12">
      <LogoLockup />

      <Link
        href={authHeaderContent.homeHref}
        className="text-white underline-offset-4 transition-colors hover:scale-105 hover:text-blue-600 hover:underline md:text-sm"
      >
        {authHeaderContent.homeLabel}
      </Link>
    </header>
  )
}
