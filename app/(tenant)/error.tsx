"use client"

import { useEffect } from "react"

import { GenericErrorPage } from "@/components/shared/generic-error-page"
import { errorPageContent } from "@/content/common"

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("tenant route error", { message: error.message, digest: error.digest })
  }, [error])

  return (
    <GenericErrorPage
      title={errorPageContent.tenant.title}
      description={errorPageContent.tenant.description}
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Dashboard", href: "/dashboard", variant: "outline" },
      ]}
    />
  )
}
