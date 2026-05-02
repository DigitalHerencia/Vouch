import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignupForm } from "@/features/auth/sign-up-page"
import { type SignupPageProps } from "@/types/auth"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <AuthPageShell
      variant="signup"
      eyebrow="Commitment-backed payments"
      title="Create your Vouch account."
      description="Set up a verified account to create Vouches, accept invites, and confirm real-world presence."
      footnote="Vouch coordinates deterministic payment outcomes for pre-arranged, in-person commitments. It does not broker services or resolve disputes."
    >
      <SignupForm
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </AuthPageShell>
  )
}
