import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">This page could not be found.</h1>
      <p className="text-muted-foreground">
        Protected Vouch records may return not found when you are not an authorized participant.
      </p>
      <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
    </main>
  )
}
