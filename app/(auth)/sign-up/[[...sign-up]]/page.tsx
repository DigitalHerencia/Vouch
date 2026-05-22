import { Suspense } from "react"

import { SignUpForm } from "@/features/auth/signupForm"
import { SignUpSkeleton } from "@/features/auth/sign-up-skeleton"
import { type SignupPageProps } from "@/types/auth"

export default async function SignUpPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpForm
        redirectUrl={
          params.redirect_url ?? params.return_to ?? params.redirectUrl ?? params.returnTo
        }
      />
    </Suspense>
  )
}
