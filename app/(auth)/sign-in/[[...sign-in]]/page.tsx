import { Suspense } from "react"

import { SignInForm } from "@/features/auth/signinForm"
import { SignInSkeleton } from "@/features/auth/sign-in-skeleton"
import { type LoginPageProps } from "@/types/authTypes"

export default async function SignInPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInForm
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </Suspense>
  )
}
