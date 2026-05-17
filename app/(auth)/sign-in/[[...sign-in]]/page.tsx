import { Suspense } from "react"

import { SignInFeature } from "@/features/sign-in/sign-in-feature"
import { SignInSkeleton } from "@/features/sign-in/sign-in-skeleton"
import { type LoginPageProps } from "@/types/auth"

export default async function SignInPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInFeature
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </Suspense>
  )
}
