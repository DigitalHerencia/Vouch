// components/vouches/onboarding-requirement-notice.tsx

import { RequirementNoticeSplit } from "@/components/shared/requirement-notice-split"
import { vouchPageCopy } from "@/content/vouches"

export function OnboardingRequirementNotice({
  action,
}: {
  action?: ((formData: FormData) => void | Promise<void>) | undefined
}) {
  return (
    <RequirementNoticeSplit
      eyebrow={vouchPageCopy.create.onboardingEyebrow}
      title={vouchPageCopy.create.onboardingTitle}
      body={vouchPageCopy.create.onboardingBody}
      action={action}
      returnPath="/vouches/new"
    />
  )
}
