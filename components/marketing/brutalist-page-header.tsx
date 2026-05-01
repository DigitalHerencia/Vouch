// components/marketing/brutalist-page-header.tsx

import { VouchEyebrow, VouchLead, VouchPageTitle } from "@/components/brand/vouch-elements"

export interface BrutalistPageHeaderProps {
  eyebrow: string
  title: string
  body: string
  align?: "default" | "right"
}

export function BrutalistPageHeader({
  eyebrow,
  title,
  body,
  align = "default",
}: BrutalistPageHeaderProps) {
  return (
    <header className={align === "right" ? "max-w-170 lg:ml-auto" : "max-w-225"}>
      <VouchEyebrow>{eyebrow}</VouchEyebrow>
      <VouchPageTitle>{title}</VouchPageTitle>
      <VouchLead>{body}</VouchLead>
    </header>
  )
}
