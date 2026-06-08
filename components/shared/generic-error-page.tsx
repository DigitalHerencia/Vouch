import type { GenericErrorPageProps } from "@/types/commonTypes"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { safeHref } from "@/lib/utils"

export function GenericErrorPage({
  icon,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later.",
  actions,
}: GenericErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-red-600 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
          {icon || <AlertTriangle className="h-12 w-12 text-white" />}
        </div>

        <div className="space-y-4">
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-white md:text-base">{description}</p>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "default"}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? <a href={safeHref(action.href)}>{action.label}</a> : action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
