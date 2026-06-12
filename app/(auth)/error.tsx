"use client"

import { useEffect } from "react"

import { GenericErrorPage } from "@/components/shared/generic-error-page"
import { errorPageContent } from "@/content/common"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("auth route error", { message: error.message, digest: error.digest })
  }, [error])

  return (
    <GenericErrorPage
      title={errorPageContent.auth.title}
      description={errorPageContent.auth.description}
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Home", href: "/", variant: "outline" },
      ]}
    />
  )
}
