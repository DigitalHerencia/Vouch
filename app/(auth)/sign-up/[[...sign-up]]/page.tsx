
import { SignUpForm } from "@/features/auth/signupForm"
import { type SignupPageProps } from "@/types/authTypes"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <SignUpForm
      redirectUrl={params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo}
    />
  )
}
