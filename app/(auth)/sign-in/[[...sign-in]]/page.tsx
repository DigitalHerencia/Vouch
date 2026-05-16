import { SignInPageFeature } from "@/features/auth/sign-in-page"
import { type LoginPageProps } from "@/types/auth"

export default async function SignInPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <SignInPageFeature
      redirectUrl={params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo}
    />
  )
}
