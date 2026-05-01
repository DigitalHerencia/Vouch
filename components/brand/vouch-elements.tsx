// components/brand/vouch-elements.tsx

import { cn } from "@/lib/utils"

export const vouchCardClassName = "border border-neutral-700 bg-black/55 backdrop-blur-[2px]"

export const vouchContainerClassName =
  "mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16"

export function VouchEyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="size-3 bg-[#1D4ED8]" />
      <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.1em] text-white uppercase sm:text-base lg:text-lg">
        {children}
      </p>
    </div>
  )
}

export function VouchPageTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1
      className={cn(
        "mt-6 font-(family-name:--font-display) text-[62px] leading-[0.88] tracking-[0.015em] text-white uppercase sm:text-[86px] lg:text-[104px]",
        className
      )}
    >
      {children}
    </h1>
  )
}

export function VouchLead({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "mt-5 max-w-[680px] text-[18px] leading-[1.35] font-semibold text-neutral-400",
        className
      )}
    >
      {children}
    </p>
  )
}

export function VouchPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={cn(vouchCardClassName, className)}>{children}</section>
}

export function VouchStatCard({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <article className="border-b border-neutral-800 p-6 last:border-b-0 sm:[&:nth-child(2n-1)]:border-r lg:border-r lg:border-b-0 lg:last:border-r-0">
      <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.1em] text-white uppercase sm:text-base lg:text-lg">
        {label}
      </p>

      <p className="mt-5 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase sm:text-[62px]">
        {value}
      </p>

      <p className="mt-4 max-w-[240px] text-base leading-[1.28] font-semibold text-neutral-400 sm:text-lg">
        {body}
      </p>
    </article>
  )
}