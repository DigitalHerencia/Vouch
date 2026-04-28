import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CreateVouchPageProps = {
  blockedReason?: string
  setupHref?: string
  children?: ReactNode
}

export function CreateVouchPage({
  blockedReason,
  setupHref = "/setup?return_to=/vouches/new",
  children,
}: CreateVouchPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create a Vouch</h1>
        <p className="text-muted-foreground">
          Set the amount, meeting window, and recipient. Funds release only if both parties confirm
          presence during the confirmation window.
        </p>
      </div>
      {blockedReason ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle>Finish setup to continue</CardTitle>
            <CardDescription>{blockedReason}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<a href={setupHref} />}>Review setup</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vouch details</CardTitle>
            <CardDescription>
              Both people must confirm during the window for funds to release. If both do not
              confirm in time, the payment is refunded or not captured.
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Before you create</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-3 text-sm md:grid-cols-3">
          <p>Vouch does not judge disputes or decide who was right.</p>
          <p>One-sided confirmation never releases funds.</p>
          <p>Fees must be shown before payment commitment.</p>
        </CardContent>
      </Card>
    </main>
  )
}
