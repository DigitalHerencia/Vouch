import { SetupPage } from "@/features/setup/setup-page"
import { getSetupPageState } from "@/lib/fetchers/setupFetchers"

type PageProps = { searchParams?: Promise<{ return_to?: string }> }

export default async function SetupRoute({ searchParams }: PageProps) {
  const params = await searchParams
  const state = await getSetupPageState(
    params?.return_to ? { returnTo: params.return_to } : undefined
  )
  const setup = state.setup
  return (
    <SetupPage
      {...(state.returnTo ? { returnTo: state.returnTo } : {})}
      items={[
        {
          id: "account",
          label: "Account active",
          complete: setup.userStatus === "active",
          description: "Your account exists and can continue setup.",
        },
        {
          id: "identity",
          label: "Identity verification",
          complete: setup.identityStatus === "verified",
          description: "Required before payment-backed flows.",
          actionLabel: "Verify",
          actionHref: "/settings/verification",
        },
        {
          id: "eligibility",
          label: "Adult eligibility",
          complete: setup.adultStatus === "verified",
          description: "Required for payment-bearing participation.",
          actionLabel: "Review",
          actionHref: "/settings/verification",
        },
        {
          id: "payment",
          label: "Payment method",
          complete: setup.paymentReadiness === "ready",
          description: "Required to create Vouches.",
          actionLabel: "Set up",
          actionHref: "/settings/payment",
        },
        {
          id: "payout",
          label: "Payout account",
          complete: setup.payoutReadiness === "ready",
          description: "Required to accept Vouches.",
          actionLabel: "Set up",
          actionHref: "/settings/payout",
        },
        {
          id: "terms",
          label: "Terms",
          complete: setup.termsAccepted,
          description: "Required before creating or accepting a Vouch.",
          actionLabel: "Review",
          actionHref: "/legal/terms",
        },
      ]}
    />
  )
}
