"use client"

import { useSignUp } from "@clerk/nextjs"
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
import { signupSchema, verificationSchema } from "@/schemas/auth"
import { type SignupFormProps, type SignupFormValues } from "@/types/auth"

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

export function SignupForm({ className, redirectUrl, ...props }: SignupFormProps) {
  const { fetchStatus, signUp } = useSignUp()
  const router = useRouter()
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [isResending, startResending] = useTransition()
  const [isResetting, startResetting] = useTransition()

  const form = useForm<SignupFormValues>({
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      verificationCode: "",
    },
  })

  const nextUrl = sanitizePostAuthRedirect(redirectUrl)
  const isBusy = form.formState.isSubmitting || isResending || isResetting || !fetchStatus

  async function finalizeAndRedirect(): Promise<boolean> {
    if (signUp.status !== "complete" && !signUp.createdSessionId) {
      form.setError("root", {
        message: `Cannot finalize sign-up yet. Current Clerk status: ${signUp.status}.`,
      })
      return false
    }

    const finalizeResult = await signUp.finalize({
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
        message: finalizeResult.error.message || "Unable to finalize sign-up.",
      })
      return false
    }

    router.refresh()
    return true
  }

  async function sendVerificationCode(): Promise<boolean> {
    const sendResult = await signUp.verifications.sendEmailCode()

    if (sendResult.error) {
      form.setError("root", {
        message: sendResult.error.message || "Could not send the verification code.",
      })
      return false
    }

    setNotice("We sent a verification code to your email address.")
    return true
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!fetchStatus) return

    form.clearErrors()
    setNotice(null)

    try {
      if (awaitingVerification) {
        const parsedVerification = verificationSchema.safeParse({
          verificationCode: values.verificationCode,
        })

        if (!parsedVerification.success) {
          form.setError("verificationCode", {
            message: parsedVerification.error.issues[0]?.message || "Enter the verification code.",
          })
          return
        }

        const verifyResult = await signUp.verifications.verifyEmailCode({
          code: parsedVerification.data.verificationCode,
        })

        if (verifyResult.error) {
          form.setError("root", {
            message: verifyResult.error.message || "Invalid verification code.",
          })
          return
        }

        if (signUp.status === "complete" || !!signUp.createdSessionId) {
          await finalizeAndRedirect()
          return
        }

        form.setError("root", {
          message: `Verification was accepted, but Clerk has not created a session yet. Current status: ${signUp.status}.`,
        })
        return
      }

      const parsedSignup = signupSchema.safeParse(values)

      if (!parsedSignup.success) {
        for (const issue of parsedSignup.error.issues) {
          const field = issue.path[0]

          if (
            typeof field === "string" &&
            (field === "firstName" ||
              field === "lastName" ||
              field === "email" ||
              field === "password")
          ) {
            form.setError(field, { message: issue.message })
          }
        }

        return
      }

      const passwordResult = await signUp.password({
        emailAddress: parsedSignup.data.email,
        password: parsedSignup.data.password,
        firstName: parsedSignup.data.firstName,
        lastName: parsedSignup.data.lastName,
      })

      if (passwordResult.error) {
        form.setError("root", {
          message: passwordResult.error.message || "Sign up failed. Please try again.",
        })
        return
      }

      if (signUp.status === "complete" || !!signUp.createdSessionId) {
        await finalizeAndRedirect()
        return
      }

      if (signUp.unverifiedFields?.includes("email_address")) {
        const sent = await sendVerificationCode()

        if (sent) {
          setAwaitingVerification(true)
          form.resetField("verificationCode")
        }

        return
      }

      form.setError("root", {
        message: `Sign-up encountered an unexpected Clerk state: ${signUp.status}.`,
      })
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Sign up failed. Please try again."),
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
            Create your account to send Vouches, accept commitment links, and manage setup for
            payment-backed confirmation.
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

        {awaitingVerification ? (
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
                Confirm your email to finish account creation.
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
                disabled={isBusy}
                variant="outline"
                className={secondaryButtonClassName}
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendVerificationCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              disabled={isBusy}
              variant="ghost"
              className={secondaryButtonClassName}
              onClick={() => {
                startResetting(async () => {
                  await signUp.reset()
                  setAwaitingVerification(false)
                  setNotice(null)
                  form.reset({
                    firstName: form.getValues("firstName"),
                    lastName: form.getValues("lastName"),
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel className={labelClassName} htmlFor="firstName">
                  First name
                </FieldLabel>

                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={inputClassName}
                  disabled={isBusy}
                  {...form.register("firstName", {
                    setValueAs: (value: string) => (typeof value === "string" ? value.trim() : ""),
                  })}
                />

                <FieldError
                  errors={
                    form.formState.errors.firstName?.message
                      ? [{ message: form.formState.errors.firstName.message }]
                      : undefined
                  }
                />
              </Field>

              <Field>
                <FieldLabel className={labelClassName} htmlFor="lastName">
                  Last name
                </FieldLabel>

                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={inputClassName}
                  disabled={isBusy}
                  {...form.register("lastName", {
                    setValueAs: (value: string) => (typeof value === "string" ? value.trim() : ""),
                  })}
                />

                <FieldError
                  errors={
                    form.formState.errors.lastName?.message
                      ? [{ message: form.formState.errors.lastName.message }]
                      : undefined
                  }
                />
              </Field>
            </div>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={inputClassName}
                disabled={isBusy}
                {...form.register("password")}
              />

              <FieldDescription className="font-mono text-sm text-neutral-600">
                Use a strong password you haven&apos;t used elsewhere.
              </FieldDescription>

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
              Create account
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-base font-semibold text-neutral-500">
              <span>Already have an account?</span>
              <Link
                href={
                  redirectUrl
                    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-in"
                }
                className="text-[#1D4ED8] transition hover:text-blue-400"
              >
                Sign in
              </Link>
            </div>

            <div id="clerk-captcha" />
          </div>
        )}
      </FieldGroup>
    </form>
  )
}
