import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none border border-neutral-800 bg-neutral-900", className)}
      {...props}
    />
  )
}

export { Skeleton }
