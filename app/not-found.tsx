import { NotFoundPage } from "@/components/shared/not-found-page"
import { errorPageContent } from "@/content/common"

export default function NotFound() {
  return (
    <NotFoundPage
      description={errorPageContent.notFound.description}
      homeHref="/dashboard"
      backHref="/"
    />
  )
}
