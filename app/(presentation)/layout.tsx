// app/(presentation)/layout.tsx

import { PresentationShell } from "@/components/navigation/presentation-shell"

export default function PresentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PresentationShell>{children}</PresentationShell>
}
