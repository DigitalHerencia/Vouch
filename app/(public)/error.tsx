"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col justify-center gap-4 px-6 py-12"><h1 className="text-3xl font-semibold tracking-tight">Something went wrong.</h1><p className="text-muted-foreground">No payment or confirmation state was changed.</p><Button type="button" onClick={reset}>Try again</Button></main>
}
