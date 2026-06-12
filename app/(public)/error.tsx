"use client"

import { useEffect } from "react"

import { GenericErrorPage } from "@/components/shared/generic-error-page"
import { errorPageContent } from "@/content/common"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("public route error", { message: error.message, digest: error.digest })
  }, [error])

  return (
    <GenericErrorPage
      title={errorPageContent.public.title}
      description={errorPageContent.public.description}
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Home", href: "/", variant: "outline" },
      ]}
    />
  )
}
