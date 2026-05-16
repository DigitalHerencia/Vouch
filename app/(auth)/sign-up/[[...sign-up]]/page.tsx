import { SignUpPageFeature } from "@/features/auth/sign-up-page"
import { type SignupPageProps } from "@/types/auth"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <SignUpPageFeature
      redirectUrl={params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo}
    />
  )
}
