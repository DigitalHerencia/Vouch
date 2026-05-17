import { Suspense } from "react"

import { SignUpFeature } from "@/features/sign-up/sign-up-feature"
import { SignUpSkeleton } from "@/features/sign-up/sign-up-skeleton"
import { type SignupPageProps } from "@/types/auth"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpFeature
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </Suspense>
  )
}
