// components/shared/surface.tsx

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva("rounded-none", {
  variants: {
    variant: {
      panel: "border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
      solid: "border border-neutral-800 bg-black",
      muted: "border border-neutral-800 bg-neutral-950",
      ghost: "bg-transparent",
      blue: "border-primary bg-primary text-primary-foreground border",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-7 sm:p-8",
      xl: "p-8 sm:p-10 lg:p-12",
    },
  },
  defaultVariants: {
    variant: "panel",
    padding: "none",
  },
})

type SurfaceOwnProps<TElement extends ElementType> = {
  as?: TElement
  children: ReactNode
  className?: string
} & VariantProps<typeof surfaceVariants>

type SurfaceProps<TElement extends ElementType> = SurfaceOwnProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof SurfaceOwnProps<TElement>>

export function Surface<TElement extends ElementType = "section">({
  as,
  children,
  className,
  variant,
  padding,
  ...props
}: SurfaceProps<TElement>) {
  const Component = as ?? "section"

  return (
    <Component className={cn(surfaceVariants({ variant, padding }), className)} {...props}>
      {children}
    </Component>
  )
}

export function SurfaceHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("border-b border-neutral-800 px-6 py-6", className)}>{children}</div>
}

export function SurfaceBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6 sm:p-8", className)}>{children}</div>
}

export function SurfaceFooter({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode
  className?: string
  variant?: "default" | "blue"
}) {
  return (
    <div
      className={cn(
        variant === "blue"
          ? "bg-primary text-primary-foreground px-5 py-5 text-center font-(family-name:--font-display) text-sm leading-none tracking-widest uppercase sm:text-base lg:text-lg"
          : "border-t border-neutral-800 px-6 py-6",
        className
      )}
    >
      {children}
    </div>
  )
}

export { surfaceVariants }
