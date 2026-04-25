import { cn } from "@/lib/utils"

export function FormError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null

  return (
    <p role="alert" className={cn("rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200", className)}>
      {message}
    </p>
  )
}
