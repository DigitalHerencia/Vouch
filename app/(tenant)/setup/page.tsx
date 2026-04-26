import { SetupPage } from "@/features/setup"

export default function SetupRoute() {
  return (
    <SetupPage
      items={[
        { label: "Account active", status: "complete", description: "Your account exists and can continue setup." },
        { label: "Identity verification", status: "action_required", description: "Required before payment-backed flows." },
        { label: "Adult eligibility", status: "action_required", description: "Required for payment-bearing participation." },
        { label: "Payment method", status: "action_required", description: "Required to create Vouches." },
        { label: "Payout account", status: "action_required", description: "Required to accept Vouches that release funds to you." },
        { label: "Terms", status: "action_required", description: "Required before creating or accepting a Vouch." },
      ]}
    />
  )
}
