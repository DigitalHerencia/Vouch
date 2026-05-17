import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHero } from "@/components/shared/page-hero"
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
      <PageHero
        eyebrow={vouchPageCopy.create.eyebrow}
        title={vouchPageCopy.create.reviewTitle}
        body={vouchPageCopy.create.reviewBody}
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
