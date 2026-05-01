// app/(public)/layout.tsx

import { LogoLockup } from "@/components/brand/logo-lockup"
import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <PublicHeader logo={<LogoLockup />} />
      {children}
      <PublicFooter />
    </>
  )
}
