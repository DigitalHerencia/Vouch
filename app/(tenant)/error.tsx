"use client"

import { useEffect } from "react"

import { GenericErrorPage } from "@/components/shared/generic-error-page"

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
      title="Dashboard view failed"
      description="This participant-scoped Vouch surface could not render. Try again or return to the dashboard."
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Dashboard", href: "/dashboard", variant: "outline" },
      ]}
    />
  )
}
