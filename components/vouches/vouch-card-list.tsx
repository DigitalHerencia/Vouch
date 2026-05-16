import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { VouchCard, type VouchCardProps } from "@/components/vouches/vouch-card"
import { dashboardContent } from "@/content/dashboard"

export interface VouchCardListProps {
  title: string
  description: string
  emptyText: string
  icon: LucideIcon
  rows: VouchCardProps["vouch"][]
}

export function VouchCardList({
  title,
  description,
  emptyText,
  icon: Icon,
  rows,
}: VouchCardListProps) {
  return (
    <Surface>
      <SurfaceHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 text-primary" strokeWidth={1.9} />
          <div>
            <h2 className="text-[24px] leading-none text-white sm:text-[30px]">{title}</h2>
            <p className="mt-2 text-[15px] leading-[1.3] font-semibold text-neutral-400">
              {description}
            </p>
          </div>
        </div>
        <Button variant="link" render={<Link href="/vouches/new" />}>
          {dashboardContent.actions.create}
        </Button>
      </SurfaceHeader>

      <div>
        {rows.length ? (
          rows.map((vouch) => <VouchCard key={vouch.id} vouch={vouch} />)
        ) : (
          <p className="border-t border-neutral-800 px-5 py-6 text-[15px] font-semibold text-neutral-400 sm:px-7">
            {emptyText}
          </p>
        )}
      </div>
    </Surface>
  )
}
