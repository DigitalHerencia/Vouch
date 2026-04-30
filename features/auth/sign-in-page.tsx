"use client"

import { useSignIn } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { LogoLockup } from "@/components/brand/logo-lockup"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { cn } from "@/lib/utils"
import { loginSchema, verificationSchema } from "@/schemas/auth"
import { type LoginFormProps, type LoginFormValues } from "@/types/auth"

function getErrorMessage(error: unknown, fallback: string): string {
  const clerkError = error as { errors?: Array<{ message?: string }> }
  const firstMessage = clerkError.errors?.[0]?.message

  return typeof firstMessage === "string" && firstMessage.trim().length > 0
    ? firstMessage
    : fallback
}

export function LoginForm({ className, redirectUrl, ...props }: LoginFormProps) {
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
  const nextUrl = sanitizePostAuthRedirect(redirectUrl)
  const isBusy = form.formState.isSubmitting || isResending || isResetting || !fetchStatus

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
      setNotice("We sent a verification code to your email address.")
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
      setNotice("We sent a verification code to your phone.")
      return true
    }

    form.setError("root", {
      message: "No supported verification method is available for this account.",
    })
    return false
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!fetchStatus) {
      return
    }

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
    <form
      className={cn("flex flex-col gap-6 bg-neutral-950/90", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup className="gap-6 border border-neutral-800 bg-neutral-950 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-neutral-50 transition hover:text-blue-300"
          >
            <LogoLockup />
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-50 uppercase sm:text-4xl">
            Sign in to Vouch
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
            Access your dashboard, active Vouches, confirmation windows, and payment setup status.
          </p>
        </div>

        {notice ? (
          <div className="border border-blue-900/60 bg-blue-950/40 px-4 py-3 text-sm text-blue-100">
            {notice}
          </div>
        ) : null}

        {form.formState.errors.root?.message ? (
          <div className="border border-red-950/60 bg-red-950/30 px-4 py-3 text-sm text-red-100">
            {form.formState.errors.root.message}
          </div>
        ) : null}

        {awaitingSecondFactor ? (
          <div className="space-y-5">
            <Field>
              <FieldLabel className="text-neutral-100" htmlFor="verificationCode">
                Verification code
              </FieldLabel>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the code you received"
                className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                disabled={isBusy}
                {...form.register("verificationCode", {
                  setValueAs: (value: string) =>
                    typeof value === "string" ? value.replace(/\s+/g, "").trim() : "",
                })}
              />
              <FieldDescription className="text-neutral-400">
                Use the latest code sent to your{" "}
                {secondFactorMethod === "phone_code" ? "phone" : "email"}.
              </FieldDescription>
              <FieldError
                errors={
                  form.formState.errors.verificationCode?.message
                    ? [
                        {
                          message: form.formState.errors.verificationCode.message,
                        },
                      ]
                    : undefined
                }
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="submit"
                disabled={isBusy}
                className="h-12 bg-blue-600 text-xs font-semibold text-neutral-100 transition-all duration-300 hover:border-2 hover:border-blue-600 hover:bg-transparent hover:text-blue-400 sm:text-sm"
              >
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify code
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                className="h-12 border border-neutral-700 bg-neutral-900 text-neutral-100 transition-all duration-300 hover:border-blue-600 hover:bg-neutral-950"
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendSecondFactorCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              className="w-full border border-neutral-700 bg-neutral-900 text-neutral-100 transition-all duration-300 hover:border-blue-600 hover:bg-neutral-950"
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
              {isResetting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start over
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <Field>
              <FieldLabel className="text-neutral-100" htmlFor="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                disabled={isBusy}
                {...form.register("email", {
                  setValueAs: (value: string) =>
                    typeof value === "string" ? value.trim().toLowerCase() : "",
                })}
              />
              <FieldError
                errors={
                  form.formState.errors.email?.message
                    ? [{ message: form.formState.errors.email.message }]
                    : undefined
                }
              />
            </Field>

            <Field>
              <FieldLabel className="text-neutral-100" htmlFor="password">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                disabled={isBusy}
                {...form.register("password")}
              />
              <FieldError
                errors={
                  form.formState.errors.password?.message
                    ? [{ message: form.formState.errors.password.message }]
                    : undefined
                }
              />
            </Field>

            <Button
              type="submit"
              disabled={isBusy}
              className="flex h-12 w-full items-center gap-2 bg-blue-600 text-xs font-semibold text-neutral-100 transition-all duration-300 hover:border-2 hover:border-blue-600 hover:bg-transparent hover:text-blue-400 sm:text-sm"
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign in
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-neutral-400">
              <span>Need an account?</span>
              <Link
                href={
                  redirectUrl
                    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-up"
                }
                className="font-medium text-blue-500 transition hover:text-blue-300"
              >
                Create one
              </Link>
            </div>
          </div>
        )}
      </FieldGroup>
    </form>
  )
}
