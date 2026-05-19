import type { LucideIcon } from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface CalloutPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode
  body?: ReactNode | undefined
  icon?: LucideIcon | undefined
  actions?: ReactNode | undefined
}

export function CalloutPanel({
  title,
  body,
  icon: Icon,
  actions,
  className,
  ...props
}: CalloutPanelProps) {
  return (
    <section
      {...props}
      className={cn(
        "grid gap-6 rounded-none border border-neutral-700 bg-black/55 p-7 backdrop-blur-[2px] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center",
        className
      )}
    >
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
        {Icon ? (
          <div className="flex size-16 items-center justify-center">
            <Icon className="size-16 p-1 text-white" strokeWidth={1.7} />
          </div>
        ) : null}

        <div>
          <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-wider text-white uppercase">
            {title}
          </h2>

          {body ? (
            <p className="mt-2 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
              {body}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">{actions}</div>
      ) : null}
    </section>
  )
}
