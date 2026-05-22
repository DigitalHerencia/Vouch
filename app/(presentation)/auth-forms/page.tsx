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
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
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
            <div className="space-y-4 text-white">
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
