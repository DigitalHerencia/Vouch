
import { SignInForm } from "@/features/auth/signinForm"
import { type LoginPageProps } from "@/types/authTypes"

export default async function SignInPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <SignInForm
      redirectUrl={params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo}
    />
  )
}
