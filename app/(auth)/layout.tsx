// app/(auth)/layout.tsx

import { AuthShell } from "@/components/nav/auth-shell"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthShell>{children}</AuthShell>
}
