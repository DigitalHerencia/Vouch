import { RequirementNoticeSplit } from "@/components/shared/requirement-notice-split"

export function OnboardingRequirementNotice({
  action,
}: {
  action?: ((formData: FormData) => void | Promise<void>) | undefined
}) {
  return (
    <RequirementNoticeSplit
      eyebrow="Onboarding required"
      title="Connect Stripe to start creating Vouches"
      body="Vouch uses Stripe to keep payments secure and easy to manage. Connect your Stripe account once, then you can create Vouches and manage payouts from Stripe."
      action={action}
      returnPath="/vouches/new"
    />
  )
}
