import { cn } from "@/lib/utils"

export function FieldError({ id, message, className }: { id?: string; message?: string | null; className?: string }) {
  if (!message) return null

  return (
    <p id={id} role="alert" className={cn("text-sm text-red-300", className)}>
      {message}
    </p>
  )
}
