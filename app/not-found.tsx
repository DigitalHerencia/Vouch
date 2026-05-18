import { ErrorPages } from "@/components/blocks/error-pages"

export default function NotFound() {
  return (
    <ErrorPages.NotFound
      description="The requested Vouch surface could not be found. Protected records may also return not found when the active user is not an authorized participant."
      homeHref="/dashboard"
      backHref="/"
      className="grid-pattern bg-neutral-950"
    />
  )
}
