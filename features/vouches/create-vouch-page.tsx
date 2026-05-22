import Link from "next/link"

import { CTASection } from "@/components/blocks/cta-section"
import { HeroSection } from "@/components/blocks/hero-section"
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
      <HeroSection.Minimal
        title={vouchPageCopy.create.title}
        description={vouchPageCopy.create.readyBody}
      />
      {blockedReason ? (
        <Card>
          <CardHeader>
            <CardTitle>{vouchPageCopy.create.blockedTitle}</CardTitle>
            <CardDescription>{blockedReason}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">{vouchPageCopy.create.blockedActionLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CreateVouchDraftForm />
      )}
      <CTASection.WithBackground
        title={vouchPageCopy.create.ruleTitle}
        description={vouchPageCopy.create.ruleBody}
        primaryAction={{ label: vouchPageCopy.create.blockedActionLabel, href: "/dashboard" }}
      />
    </main>
  )
}
