import Image from "next/image"
import { RequirementNoticeSplit } from "@/components/shared/requirement-notice-split"
import { Button } from "@/components/ui/button"

export function DashboardRequirementsNotice({
  action,
}: {
  action?: ((formData: FormData) => void | Promise<void>) | undefined
}) {
  return (
    <RequirementNoticeSplit
      eyebrow="Payment method"
      title="Save a payment method with Stripe"
      body="Save a payment method to unlock dashboard operations and future protocol-fee Checkout. This does not make a payment."
      action={action}
      actionLabel="Save payment method"
      returnPath="/dashboard"
    />
  )
}
