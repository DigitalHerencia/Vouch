"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">This route failed to load.</h1>
      <p className="text-muted-foreground">No Vouch lifecycle state was changed.</p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  )
}
