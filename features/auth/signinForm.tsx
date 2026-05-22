"use client"

import { useSignIn } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { AuthForms } from "@/components/blocks/auth-forms"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authVerificationContent } from "@/content/auth"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { loginSchema, verificationSchema } from "@/schemas/auth"
import { type LoginFormProps, type LoginFormValues } from "@/types/auth"

const inputClassName =
  "h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-blue-600 focus-visible:ring-0"

function getErrorMessage(error: unknown, fallback: string): string {
  const clerkError = error as { errors?: Array<{ message?: string }> }
  const firstMessage = clerkError.errors?.[0]?.message

  return typeof firstMessage === "string" && firstMessage.trim().length > 0
    ? firstMessage
    : fallback
}

export default function LoginForm({ redirectUrl }: { redirectUrl?: string | undefined }) {
  return <SignInForm redirectUrl={redirectUrl} />
}

export function SignInForm({ redirectUrl, ...props }: LoginFormProps) {
  const { fetchStatus, signIn } = useSignIn()
  const router = useRouter()
  const [awaitingSecondFactor, setAwaitingSecondFactor] = useState(false)
  const [secondFactorMethod, setSecondFactorMethod] = useState<"email_code" | "phone_code" | null>(
    null
  )
  const [notice, setNotice] = useState<string | null>(null)
  const [isResending, startResending] = useTransition()
  const [isResetting, startResetting] = useTransition()

  const form = useForm<LoginFormValues>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      verificationCode: "",
    },
  })

  const verificationCode = useWatch({
    control: form.control,
    name: "verificationCode",
  })

  const nextUrl = sanitizePostAuthRedirect(redirectUrl)
  const isBusy = form.formState.isSubmitting || isResending || isResetting || !fetchStatus
  const rootError = form.formState.errors.root?.message

  async function finalizeAndRedirect(): Promise<boolean> {
    const finalizeResult = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          form.setError("root", {
            message: "Finish the required account step before continuing.",
          })
          return
        }

        const url = decorateUrl(nextUrl)

        if (url.startsWith("http")) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })

    if (finalizeResult.error) {
      form.setError("root", {
        message: finalizeResult.error.message || "Unable to finalize sign-in.",
      })
      return false
    }

    router.refresh()
    return true
  }

  async function sendSecondFactorCode(): Promise<boolean> {
    const supportsEmailCode = signIn.supportedSecondFactors.some(
      (factor) => factor.strategy === "email_code"
    )

    if (supportsEmailCode) {
      const sendResult = await signIn.mfa.sendEmailCode()

      if (sendResult.error) {
        form.setError("root", {
          message: sendResult.error.message || "Could not send the email verification code.",
        })
        return false
      }

      setSecondFactorMethod("email_code")
      setNotice(authVerificationContent.sentToEmailHeading)
      return true
    }

    const supportsPhoneCode = signIn.supportedSecondFactors.some(
      (factor) => factor.strategy === "phone_code"
    )

    if (supportsPhoneCode) {
      const sendResult = await signIn.mfa.sendPhoneCode()

      if (sendResult.error) {
        form.setError("root", {
          message: sendResult.error.message || "Could not send the phone verification code.",
        })
        return false
      }

      setSecondFactorMethod("phone_code")
      setNotice(authVerificationContent.sentToPhoneHeading)
      return true
    }

    form.setError("root", {
      message: "No supported verification method is available for this account.",
    })
    return false
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!fetchStatus) return

    form.clearErrors()
    setNotice(null)

    try {
      if (awaitingSecondFactor) {
        const parsedVerification = verificationSchema.safeParse({
          verificationCode: values.verificationCode,
        })

        if (!parsedVerification.success) {
          form.setError("verificationCode", {
            message: parsedVerification.error.issues[0]?.message || "Enter the verification code.",
          })
          return
        }

        const verifyResult =
          secondFactorMethod === "phone_code"
            ? await signIn.mfa.verifyPhoneCode({
                code: parsedVerification.data.verificationCode,
              })
            : await signIn.mfa.verifyEmailCode({
                code: parsedVerification.data.verificationCode,
              })

        if (verifyResult.error) {
          form.setError("root", {
            message: verifyResult.error.message || "Invalid verification code.",
          })
          return
        }

        if (signIn.status === "complete" || !!signIn.createdSessionId) {
          await finalizeAndRedirect()
          return
        }

        form.setError("root", {
          message: `Verification is not complete yet (status: ${signIn.status}).`,
        })
        return
      }

      const parsedLogin = loginSchema.safeParse(values)

      if (!parsedLogin.success) {
        for (const issue of parsedLogin.error.issues) {
          const field = issue.path[0]

          if (typeof field === "string" && (field === "email" || field === "password")) {
            form.setError(field, { message: issue.message })
          }
        }

        return
      }

      const passwordResult = await signIn.password({
        emailAddress: parsedLogin.data.email,
        password: parsedLogin.data.password,
      })

      if (passwordResult.error) {
        form.setError("root", {
          message: passwordResult.error.message || "Invalid email or password.",
        })
        return
      }

      if (signIn.status === "complete" || !!signIn.createdSessionId) {
        await finalizeAndRedirect()
        return
      }

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const sent = await sendSecondFactorCode()

        if (sent) {
          setAwaitingSecondFactor(true)
          form.resetField("verificationCode")
        }

        return
      }

      form.setError("root", {
        message: `Sign-in requires additional verification in Clerk (${signIn.status}).`,
      })
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Invalid email or password."),
      })
    }
  })

  return (
    <main className="h-dvh min-h-0 w-full overflow-hidden">
      <section className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden md:grid-cols-2">
        <div className="hidden min-h-0 md:block">
          <AuthContentPanel />
        </div>

        <div className="min-h-0">
          <SignInFormPanel>
            <form onSubmit={handleSubmit} noValidate {...props}>
              {awaitingSecondFactor ? (
                <AuthForms.OTPVerification
                  title={authVerificationContent.codeLabel}
                  description={
                    secondFactorMethod === "phone_code"
                      ? authVerificationContent.latestCodePhone
                      : authVerificationContent.latestCodeEmail
                  }
                  length={6}
                  value={verificationCode}
                  error={form.formState.errors.verificationCode?.message}
                  disabled={isBusy}
                  onChange={(code) =>
                    form.setValue("verificationCode", code, {
                      shouldDirty: true,
                      shouldValidate: code.length === 6,
                    })
                  }
                  actions={
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button type="submit" disabled={isBusy} className="w-full" size="lg">
                        {form.formState.isSubmitting ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : null}
                        {authVerificationContent.verifyCode}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          startResending(async () => {
                            form.clearErrors("root")
                            setNotice(null)
                            await sendSecondFactorCode()
                          })
                        }}
                      >
                        {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                        {authVerificationContent.resendCode}
                      </Button>

                      <Button
                        type="button"
                        variant="link"
                        disabled={isBusy}
                        className="sm:col-span-2"
                        onClick={() => {
                          startResetting(async () => {
                            await signIn.reset()
                            setAwaitingSecondFactor(false)
                            setSecondFactorMethod(null)
                            setNotice(null)
                            form.reset({
                              email: form.getValues("email"),
                              password: "",
                              verificationCode: "",
                            })
                          })
                        }}
                      >
                        {isResetting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                        {authVerificationContent.startOver}
                      </Button>
                    </div>
                  }
                />
              ) : (
                <AuthForms.Login
                  title="Back your commitment."
                  description="Sign in to manage Vouches, confirm presence, and keep payment-backed commitments on track."
                  notice={notice}
                  error={rootError}
                  footer={
                    <span>
                      Need an account?{" "}
                      <Link
                        href={
                          redirectUrl
                            ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                            : "/sign-up"
                        }
                        className="text-blue-600 underline-offset-4 hover:text-white hover:underline"
                      >
                        Create one
                      </Link>
                    </span>
                  }
                >
                  <FieldGroup className="gap-4 border-0 bg-transparent p-0 shadow-none">
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        className={inputClassName}
                        disabled={isBusy}
                        {...form.register("email", {
                          setValueAs: (value: string) =>
                            typeof value === "string" ? value.trim().toLowerCase() : "",
                        })}
                      />
                      <FieldError
                        {...(form.formState.errors.email?.message
                          ? { errors: [{ message: form.formState.errors.email.message }] }
                          : {})}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={inputClassName}
                        disabled={isBusy}
                        {...form.register("password")}
                      />
                      <FieldDescription>Use your Vouch account password.</FieldDescription>
                      <FieldError
                        {...(form.formState.errors.password?.message
                          ? { errors: [{ message: form.formState.errors.password.message }] }
                          : {})}
                      />
                    </Field>

                    <Button type="submit" disabled={isBusy} className="w-full" size="lg">
                      {form.formState.isSubmitting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : null}
                      Sign in
                    </Button>
                  </FieldGroup>
                </AuthForms.Login>
              )}
            </form>
          </SignInFormPanel>
        </div>
      </section>
    </main>
  )
}

function AuthContentPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center overflow-hidden border-r-3 border-neutral-400 bg-black p-6 md:p-8">
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-2">
          <p className="font-(family-name:--font-display) text-sm font-bold tracking-widest text-blue-600 uppercase md:text-base">
            Authenticated protocol
          </p>
          <h2>Commitment-backed access</h2>
          <p className="max-w-prose text-neutral-400">
            Sign in before creating, accepting, or confirming Vouches. Account state stays tied to
            authenticated users and provider-backed readiness.
          </p>
        </div>
      </div>
    </div>
  )
}

function SignInFormPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden bg-black p-6 pt-24 pb-20 md:p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">{children}</div>
    </div>
  )
}
