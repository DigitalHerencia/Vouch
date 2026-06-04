"use client"

import { useEffect } from "react"

import { GenericErrorPage } from "@/components/shared/generic-error-page"

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
      title="Authentication view failed"
      description="The authentication surface could not render. Try again or return home."
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Home", href: "/", variant: "outline" },
      ]}
    />
  )
}
