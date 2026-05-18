"use client"

import { useEffect } from "react"

import { ErrorPages } from "@/components/blocks/error-pages"

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
    <ErrorPages.Generic
      title="Public view failed"
      description="This public Vouch surface could not render. Try again or return home."
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Home", href: "/", variant: "outline" },
      ]}
      className="grid-pattern bg-neutral-950"
    />
  )
}
