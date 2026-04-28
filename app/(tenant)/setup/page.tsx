import { SetupPage } from "@/features/setup"

export default function SetupRoute() {
  return (
    <SetupPage
      items={[
        {
          id: "account",
          label: "Account active",
          complete: true,
          description: "Your account exists and can continue setup.",
        },
        {
          id: "identity",
          label: "Identity verification",
          complete: false,
          description: "Required before payment-backed flows.",
          actionLabel: "Verify",
          actionHref: "/settings/verification",
        },
        {
          id: "eligibility",
          label: "Adult eligibility",
          complete: false,
          description: "Required for payment-bearing participation.",
          actionLabel: "Review",
          actionHref: "/settings/verification",
        },
        {
          id: "payment",
          label: "Payment method",
          complete: false,
          description: "Required to create Vouches.",
          actionLabel: "Set up",
          actionHref: "/settings/payment",
        },
        {
          id: "payout",
          label: "Payout account",
          complete: false,
          description: "Required to accept Vouches that release funds to you.",
          actionLabel: "Set up",
          actionHref: "/settings/payout",
        },
        {
          id: "terms",
          label: "Terms",
          complete: false,
          description: "Required before creating or accepting a Vouch.",
          actionLabel: "Review",
          actionHref: "/legal/terms",
        },
      ]}
    />
  )
}
