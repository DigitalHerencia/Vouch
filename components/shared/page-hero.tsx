import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { landingHeroActionsContent } from "@/content/marketing"
import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

export function PageHero({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 uppercase">
        {eyebrow ? (
          <p>
            <span className="size-2 bg-blue-600" />
            {eyebrow}
          </p>
        ) : null}
      </div>

      <h1 className="font-brand text-5xl leading-tight font-black tracking-tight text-neutral-100 uppercase shadow-blue-600 md:text-7xl">
        {title}
      </h1>

      {body ? <p className="text-neutral-400">{body}</p> : null}

      {actions ? (
        actions
      ) : (
        <div className="flex flex-row gap-3 sm:flex-col md:flex-row">
          <Button
            variant="primary"
            size="cta"
            render={<Link href="/sign-up?return_to=/vouches/new" />}
          >
            {landingHeroActionsContent.primaryLabel}
            <ArrowRight className="size-5" />
          </Button>
          <Button variant="secondary" size="cta" render={<Link href="#process" />}>
            {landingHeroActionsContent.secondaryLabel}
            <ArrowDown className="size-5" />
          </Button>
        </div>
      )}
    </section>
  )
}
