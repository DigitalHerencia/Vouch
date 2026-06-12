import { safeHref } from "@/lib/utils/utils"
import type { ServerErrorPageProps } from "@/types/commonTypes"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, ServerCrash } from "lucide-react"
import { errorPageContent } from "@/content/common"

export function ServerErrorPage({
  title = errorPageContent.server.title,
  description = errorPageContent.server.description,
  errorId,
  onRetry,
  homeHref = "/",
  supportEmail,
}: ServerErrorPageProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section
        role="alert"
        className="grid w-full max-w-3xl gap-6 border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:p-8"
      >
        <div className="flex items-start gap-4 border-b-2 border-neutral-900 pb-6">
          <div className="grid size-12 shrink-0 place-items-center border-2 border-neutral-400 bg-red-600">
            <ServerCrash aria-hidden="true" className="size-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-red-500 uppercase">
              {errorPageContent.server.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl leading-none font-black tracking-tight text-white uppercase md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 font-semibold text-neutral-300 md:text-base">
              {description}
            </p>
          </div>
        </div>

        {errorId ? (
          <p className="font-mono text-xs font-bold break-all text-neutral-500">
            {errorPageContent.server.reference}: {errorId}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {errorPageContent.server.retry}
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              {errorPageContent.server.home}
            </a>
          </Button>
        </div>

        {supportEmail ? (
          <p className="text-sm text-neutral-400">
            {errorPageContent.server.supportPrompt}{" "}
            <a
              href={safeHref(`mailto:${supportEmail}`)}
              className="font-bold text-white hover:text-blue-600 hover:underline hover:underline-offset-4"
            >
              {errorPageContent.server.supportAction}
            </a>
          </p>
        ) : null}
      </section>
    </main>
  )
}
