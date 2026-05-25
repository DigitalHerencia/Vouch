// app/(presentation)/layout.tsx

import { PresentationShell } from "@/components/(presentation)/presentation-shell"

export default function PresentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PresentationShell>{children}</PresentationShell>
}
