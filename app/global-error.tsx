"use client"

import { useEffect } from "react"

import { ServerErrorPage } from "@/components/shared/server-error-page"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorId = error.digest ?? "not provided"

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return
    }

    console.groupCollapsed("Global application error")
    console.info("Message:", error.message || "No message provided")
    console.info("Digest:", error.digest ?? "No digest provided")
    console.groupEnd()
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh overflow-x-hidden bg-black text-white antialiased">
        <ServerErrorPage
          description="Vouch could not finish this request. Try again or return home."
          errorId={errorId}
          onRetry={reset}
          homeHref="/"
        />
      </body>
    </html>
  )
}
