"use client"

import { useSignIn } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { cn } from "@/lib/utils"
import { loginSchema, verificationSchema } from "@/schemas/auth"
import { type LoginFormProps, type LoginFormValues } from "@/types/auth"

const inputClassName =
  "h-12 rounded-none border border-neutral-900 bg-black px-4 font-[family-name:var(--font-sans)] text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-800 focus-visible:border-[#1D4ED8] focus-visible:ring-0"

const labelClassName =
  "font-[family-name:var(--font-display)] text-lg font-normal tracking-wide text-white"

const primaryButtonClassName =
  "h-12 w-full rounded-none bg-[#1D4ED8] font-[family-name:var(--font-display)] text-xl font-normal tracking-wide text-white shadow-none transition hover:bg-[#1D4ED8]/90 focus-visible:ring-0"

const secondaryButtonClassName =
  "h-12 rounded-none border border-neutral-900 bg-black font-[family-name:var(--font-display)] text-lg font-normal tracking-wide text-white shadow-none transition hover:border-[#1D4ED8] hover:bg-black hover:text-[#1D4ED8] focus-visible:ring-0"

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
    <form
      className={cn("mx-auto flex w-full max-w-120 flex-col bg-transparent text-white", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup className="gap-4 border-0 bg-transparent p-0 shadow-none">
        <div className="mb-2 text-center">
          <h1 className="font-(family-name:--font-brand) text-5xl leading-[0.9] font-black tracking-[-0.06em] text-white uppercase sm:text-6xl">
            Back your commitment.
          </h1>

          <p className="mx-auto mt-4 max-w-105 text-base leading-7 font-semibold text-neutral-500">
            Sign in to manage Vouches, confirm presence, and keep payment-backed commitments on
            track.
          </p>
        </div>

        {notice ? (
          <div className="border border-[#1D4ED8]/70 bg-[#1D4ED8]/10 px-4 py-3 font-mono text-sm text-blue-100">
            {notice}
          </div>
        ) : null}

        {form.formState.errors.root?.message ? (
          <div className="border border-red-950/70 bg-red-950/30 px-4 py-3 font-mono text-sm text-red-100">
            {form.formState.errors.root.message}
          </div>
        ) : null}

        {awaitingSecondFactor ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel className={labelClassName} htmlFor="verificationCode">
                Verification code
              </FieldLabel>

              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the code you received"
                className={inputClassName}
                disabled={isBusy}
                {...form.register("verificationCode", {
                  setValueAs: (value: string) =>
                    typeof value === "string" ? value.replace(/\s+/g, "").trim() : "",
                })}
              />

              <FieldDescription className="font-mono text-sm text-neutral-600">
                Use the latest code sent to your{" "}
                {secondFactorMethod === "phone_code" ? "phone" : "email"}.
              </FieldDescription>

              <FieldError
                errors={
                  form.formState.errors.verificationCode?.message
                    ? [{ message: form.formState.errors.verificationCode.message }]
                    : undefined
                }
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" disabled={isBusy} className={primaryButtonClassName}>
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : null}
                Verify code
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                className={secondaryButtonClassName}
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendSecondFactorCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              className={secondaryButtonClassName}
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
              {isResetting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Start over
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel className={labelClassName} htmlFor="email">
                Email
              </FieldLabel>

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
                errors={
                  form.formState.errors.email?.message
                    ? [{ message: form.formState.errors.email.message }]
                    : undefined
                }
              />
            </Field>

            <Field>
              <FieldLabel className={labelClassName} htmlFor="password">
                Password
              </FieldLabel>

              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className={inputClassName}
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

            <Button type="submit" disabled={isBusy} className={primaryButtonClassName}>
              {form.formState.isSubmitting ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              Sign in
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-base font-semibold text-neutral-500">
              <span>Need an account?</span>
              <Link
                href={
                  redirectUrl
                    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-up"
                }
                className="text-[#1D4ED8] transition hover:text-blue-400"
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
