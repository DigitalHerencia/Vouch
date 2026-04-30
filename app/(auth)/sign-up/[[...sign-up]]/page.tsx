import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignupForm } from "@/features/auth/sign-up-page"
import { type SignupPageProps } from "@/types/auth"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <AuthPageShell
      eyebrow="No-show protection"
      title="Back appointments with real commitment."
      description="Create an account to send or accept commitment-backed payments for appointments and in-person agreements."
      footnote="Payment-bearing actions require account readiness, verification, payment or payout setup, and current terms acceptance."
    >
      <SignupForm
        redirectUrl={params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo}
      />
    </AuthPageShell>
  )
}
