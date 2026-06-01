"use client"

import { useEffect } from "react"

import { ServerErrorPage } from "@/components/blocks/error-pages"

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global application error", {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh overflow-x-hidden bg-black text-white antialiased">
        <ServerErrorPage
          description="Vouch could not render this application boundary. Try again. Client-visible diagnostics are intentionally limited."
          errorId={error.digest ?? "not provided"}
          onRetry={reset}
          homeHref="/"
        />
      </body>
    </html>
  )
}
