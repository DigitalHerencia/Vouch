// app/(public)/layout.tsx

import { PublicShell } from "@/components/nav/public-shell"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PublicShell>{children}</PublicShell>
}
