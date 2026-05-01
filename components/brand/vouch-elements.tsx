import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  vouchPrimaryButtonClassName,
  vouchSecondaryButtonClassName,
} from "@/components/brand/vouch-button-styles"

export const vouchCardClassName = "border border-neutral-700 bg-black/55 backdrop-blur-[2px]"

export const vouchContainerClassName =
  "mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"

export interface VouchButtonLinkProps {
  href: string
  children: ReactNode
  className?: string
  icon?: LucideIcon
}

export function VouchPrimaryLink({ href, children, className, icon: Icon }: VouchButtonLinkProps) {
  return (
    <Link href={href} className={cn(vouchPrimaryButtonClassName, className)}>
      {children}
      {Icon ? <Icon className="size-5 shrink-0" /> : null}
    </Link>
  )
}

export function VouchSecondaryLink({
  href,
  children,
  className,
  icon: Icon,
}: VouchButtonLinkProps) {
  return (
    <Link href={href} className={cn(vouchSecondaryButtonClassName, className)}>
      {children}
      {Icon ? <Icon className="size-5 shrink-0" /> : null}
    </Link>
  )
}

export function VouchActionRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center", className)}>
      {children}
    </div>
  )
}

export function VouchEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="size-3 bg-[#1D4ED8]" />
      <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
        {children}
      </p>
    </div>
  )
}

export function VouchPageTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h1
      className={cn(
        "font-(family-name:--font-display) text-[62px] leading-[0.88] tracking-[0.015em] text-white uppercase sm:text-[86px] lg:text-[104px]",
        className
      )}
    >
      {children}
    </h1>
  )
}

export function VouchLead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mt-5 max-w-175 text-[18px] leading-[1.35] font-semibold text-neutral-400",
        className
      )}
    >
      {children}
    </p>
  )
}

export function VouchPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn(vouchCardClassName, className)}>{children}</section>
}

export interface VouchSectionIntroProps {
  eyebrow: string
  title: string
  body: string
  className?: string
}

export function VouchSectionIntro({ eyebrow, title, body, className }: VouchSectionIntroProps) {
  return (
    <section className={cn("max-w-245", className)}>
      <VouchEyebrow>{eyebrow}</VouchEyebrow>

      <h2 className="mt-5 font-(family-name:--font-display) text-[38px] leading-none tracking-[0.035em] text-white uppercase sm:text-[48px] lg:text-[56px]">
        {title}
      </h2>

      <p className="mt-4 max-w-195 text-[18px] leading-[1.35] font-semibold text-neutral-400">
        {body}
      </p>
    </section>
  )
}

export interface VouchStat {
  label: string
  value: string
  body: string
}

function getConnectedStatClassName(index: number, total: number) {
  if (total === 4) {
    return cn(
      "border-neutral-800 p-6",
      index < total - 1 && "border-b",
      index % 2 === 0 && "sm:border-r",
      index < 2 && "sm:border-b",
      index >= 2 && "sm:border-b-0",
      "lg:border-b-0",
      index < 3 && "lg:border-r"
    )
  }

  return cn(
    "border-neutral-800 p-6",
    index < total - 1 && "border-b",
    "lg:border-b-0",
    index < total - 1 && "lg:border-r"
  )
}

export function VouchStatGrid({ stats, className }: { stats: VouchStat[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid border border-neutral-700 bg-[#050706]",
        stats.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3",
        className
      )}
    >
      {stats.map((stat, index) => (
        <VouchStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          body={stat.body}
          className={getConnectedStatClassName(index, stats.length)}
        />
      ))}
    </div>
  )
}

export function VouchStatCard({
  label,
  value,
  body,
  className,
}: VouchStat & {
  className?: string
}) {
  return (
    <article className={className}>
      <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
        {label}
      </p>

      <p className="mt-5 font-(family-name:--font-display) text-[52px] leading-[0.85] tracking-[0.02em] text-white uppercase sm:text-[60px] lg:text-[64px]">
        {value}
      </p>

      <p className="mt-4 max-w-64 text-base leading-[1.28] font-semibold text-neutral-400 sm:text-lg">
        {body}
      </p>
    </article>
  )
}
