import { ArrowLeft, FileQuestion, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { safeHref } from "@/lib/utils"
import { type NotFoundPageProps } from "@/types/commonTypes"
import { Input } from "@/components/ui/input"

export function NotFoundPage({
  title = "404",
  description = "Oops! The page you're looking for doesn't exist or has been moved.",
  showSearch = false,
  searchQuery = "",
  onSearchQueryChange,
  onSearch,
  homeHref = "/",
  backHref,
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 404 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-neutral-400/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <FileQuestion className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-black">Page Not Found</h2>
          <p className="text-neutral-400">{description}</p>
        </div>

        {showSearch && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSearch?.(searchQuery)
            }}
            className="mx-auto flex max-w-sm gap-2"
          >
            <Input
              type="search"
              placeholder="Search for pages..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange?.(event.target.value)}
              className="border-2 border-neutral-400"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
          {backHref && (
            <Button variant="outline" asChild>
              <a href={safeHref(backHref)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
