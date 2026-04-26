"use client"

import { RoutePlaceholder } from "@/features/system/route-placeholder"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RoutePlaceholder
      title="Something went wrong"
      description={error.message}
      actionLabel="Try again"
      onAction={reset}
    />
  )
}
