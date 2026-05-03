// components/shared/action-row.tsx

import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const actionRowVariants = cva("flex", {
  variants: {
    direction: {
      responsive: "flex-col sm:flex-row",
      row: "flex-row",
      column: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    gap: {
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    margin: {
      none: "mt-0",
      sm: "mt-4",
      md: "mt-6",
      lg: "mt-8",
    },
  },
  defaultVariants: {
    direction: "responsive",
    align: "stretch",
    justify: "start",
    gap: "md",
    wrap: false,
    margin: "lg",
  },
})

export interface ActionRowProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof actionRowVariants> {
  children: ReactNode
}

export function ActionRow({
  children,
  className,
  direction,
  align,
  justify,
  gap,
  wrap,
  margin,
  ...props
}: ActionRowProps) {
  return (
    <div
      className={cn(
        actionRowVariants({
          direction,
          align,
          justify,
          gap,
          wrap,
          margin,
        }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { actionRowVariants }
