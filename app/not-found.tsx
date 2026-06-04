import { NotFoundPage } from "@/components/shared/error-pages"

export default function NotFound() {
  return (
    <NotFoundPage
      description="The requested Vouch surface could not be found. Protected records may also return not found when the active user is not an authorized participant."
      homeHref="/dashboard"
      backHref="/"
    />
  )
}
