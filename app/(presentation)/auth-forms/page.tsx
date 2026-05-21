"use client"

import {
  AuthSplitLayout,
  ForgotPasswordForm,
  LoginForm,
  OTPVerificationForm,
  SignUpForm,
} from "@/components/blocks/auth-forms"

export default function AuthForms() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-5 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <LoginForm
          title="Welcome Back"
          description="Sign in to manage your account."
          socialProviders={["google", "github"]}
          onForgotPassword={() => undefined}
          onSignUp={() => undefined}
        />
        <SignUpForm
          title="Create Account"
          description="Start coordinating commitments today."
          socialProviders={["google", "github"]}
          onSignIn={() => undefined}
        />
        <ForgotPasswordForm onBackToLogin={() => undefined} />
        <OTPVerificationForm email="user@example.com" onResend={() => undefined} />
        <AuthSplitLayout
          brandContent={
            <div className="space-y-4 text-primary-foreground">
              <h2 className="text-4xl font-black uppercase">Vouch</h2>
              <p className="text-lg font-medium">
                Commitment-backed coordination for real-world agreements.
              </p>
            </div>
          }
        >
          <LoginForm title="Split Layout" description="A login form inside the split variant." />
        </AuthSplitLayout>
      </section>
    </main>
  )
}
