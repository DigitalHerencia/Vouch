import { ConfirmCreateVouchPageSkeleton } from "@/components/vouches/confirm-create-vouch-page-skeleton"
import { PageHero } from "@/components/shared/page-hero"
import { vouchPageCopy } from "@/content/vouches"

export async function ConfirmCreateVouchPage() {
  return <main className="grid gap-6"><PageHero eyebrow={vouchPageCopy.create.eyebrow} title="Confirm Vouch terms" body={vouchPageCopy.create.ruleBody} /><ConfirmCreateVouchPageSkeleton /></main>
}