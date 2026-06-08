import { safeHref } from "@/lib/utils"
import type { ServerErrorPageProps } from "@/types/commonTypes"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, ServerCrash } from "lucide-react"

export function ServerErrorPage({
  title = "500",
  description = "Something went wrong on our end. Our team has been notified and is working on a fix.",
  errorId,
  onRetry,
  homeHref = "/",
  supportEmail,
}: ServerErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 500 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-neutral-400/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-red-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <ServerCrash className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-black">Server Error</h2>
          <p className="text-neutral-400">{description}</p>
          {errorId && (
            <p className="border-3 border-neutral-400 bg-black p-2 text-xs text-neutral-400 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] md:text-base">
              Error ID: {errorId}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </div>

        {supportEmail && (
          <p className="text-sm text-neutral-400">
            Still having issues?{" "}
            <a
              href={safeHref(`mailto:${supportEmail}`)}
              className="font-bold text-white hover:text-blue-600 hover:underline hover:underline-offset-4"
            >
              Contact support
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
