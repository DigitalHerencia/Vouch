// app/(auth)/sign-in/[[...sign-in]]/page.tsx

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { LoginForm } from "@/features/auth/sign-in-page"
import { type LoginPageProps } from "@/types/auth"

export default async function SignInPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <AuthPageShell
      eyebrow="Commitment-backed payments"
      title="Back your commitment."
      description="Sign in to manage Vouches, confirm presence, and keep payment-backed commitments on track."
      footnote="Vouch is not a marketplace, scheduler, escrow provider, or dispute system. Users bring their own agreement; Vouch coordinates the payment outcome."
    >
      <LoginForm
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </AuthPageShell>
  )
}
