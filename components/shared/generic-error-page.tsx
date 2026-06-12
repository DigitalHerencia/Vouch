import type { GenericErrorPageProps } from "@/types/commonTypes"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { safeHref } from "@/lib/utils/utils"
import { errorPageContent } from "@/content/common"

export function GenericErrorPage({
  icon,
  title = errorPageContent.generic.title,
  description = errorPageContent.generic.description,
  actions,
}: GenericErrorPageProps) {
  return (
    <section
      role="alert"
      className="mx-auto grid w-full max-w-3xl gap-6 border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:p-8"
    >
      <div className="flex items-start gap-4 border-b-2 border-neutral-900 pb-6">
        <div className="grid size-12 shrink-0 place-items-center border-2 border-neutral-400 bg-red-600">
          {icon || <AlertTriangle aria-hidden="true" className="size-6 text-white" />}
        </div>

        <div>
          <p className="text-xs font-black tracking-[0.22em] text-red-500 uppercase">
            {errorPageContent.generic.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl leading-none font-black tracking-tight text-white uppercase md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 font-semibold text-neutral-300 md:text-base">
            {description}
          </p>
        </div>
      </div>

      {actions && actions.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row">
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
      ) : null}
    </section>
  )
}
