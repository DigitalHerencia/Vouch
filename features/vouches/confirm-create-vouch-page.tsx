import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeroSection } from "@/components/blocks/hero-section"
import { vouchPageCopy } from "@/content/vouches"
import {
  ConfirmCreateVouchForm,
  type CreateVouchDraftValues,
} from "@/features/vouches/create-vouch-page.client"

type ConfirmCreateVouchPageProps = {
  draft: CreateVouchDraftValues | null
}

export async function ConfirmCreateVouchPage({ draft }: ConfirmCreateVouchPageProps) {
  return (
    <main className="grid gap-6">
      <HeroSection.Minimal
        title={vouchPageCopy.create.reviewTitle}
        description={vouchPageCopy.create.reviewBody}
        className="px-0 py-0"
      />
      {draft ? (
        <ConfirmCreateVouchForm draft={draft} />
      ) : (
        <Alert variant="destructive">
          <AlertDescription>
            Return to the create page and enter the amount, appointment date/time, and confirmation
            window before review.
          </AlertDescription>
        </Alert>
      )}
    </main>
  )
}
