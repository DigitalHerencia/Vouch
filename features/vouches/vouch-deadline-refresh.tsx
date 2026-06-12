"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export function VouchDeadlineRefresh({
  confirmationOpensAt,
  confirmationExpiresAt,
}: {
  confirmationOpensAt: string
  confirmationExpiresAt: string
}) {
  const router = useRouter()

  React.useEffect(() => {
    const timers = [confirmationOpensAt, confirmationExpiresAt]
      .map((value) => new Date(value).getTime() - Date.now() + 1000)
      .filter((delay) => delay > 0 && delay <= 2_147_483_647)
      .map((delay) => window.setTimeout(() => router.refresh(), delay))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [confirmationExpiresAt, confirmationOpensAt, router])

  return null
}
