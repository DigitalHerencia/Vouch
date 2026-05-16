import type { ReactNode } from "react"

import { PageHero } from "@/components/shared/page-hero"

export interface LandingHeroProps {
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
}

export function LandingHero({ title, body, actions }: LandingHeroProps) {
  return <PageHero title={title} body={body} actions={actions} />
}
