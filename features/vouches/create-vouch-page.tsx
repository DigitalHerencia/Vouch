import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { PageHero } from "@/components/shared/page-hero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { vouchPageCopy } from "@/content/vouches"
import { CreateVouchDraftForm } from "@/features/vouches/create-vouch-page.client"
import { getCreateVouchPageState } from "@/lib/fetchers/vouchFetchers"

export async function CreateVouchPage() {
  const state = await getCreateVouchPageState()
  const blockedReason = state.variant === "blocked" ? state.gate.blockers.join(", ") : null
  return (
    <main className="grid gap-6">
      <PageHero
        eyebrow={vouchPageCopy.create.eyebrow}
        title={vouchPageCopy.create.title}
        body={vouchPageCopy.create.readyBody}
      />
      {blockedReason ? (
        <Card className="bg-black/80">
          <CardHeader>
            <CardTitle>{vouchPageCopy.create.blockedTitle}</CardTitle>
            <CardDescription>{blockedReason}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/dashboard" />}>{vouchPageCopy.create.blockedActionLabel}</Button>
          </CardContent>
        </Card>
      ) : (
        <CreateVouchDraftForm />
      )}
      <CalloutPanel title={vouchPageCopy.create.ruleTitle} body={vouchPageCopy.create.ruleBody} />
    </main>
  )
}
