"use client"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

import { useEffect } from "react"

import { ServerErrorPage } from "@/components/shared/server-error-page"

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
          description="Vouch could not finish this request. Try again or return home."
          errorId={error.digest ?? "not provided"}
          onRetry={reset}
          homeHref="/"
        />
      </body>
    </html>
  )
}
