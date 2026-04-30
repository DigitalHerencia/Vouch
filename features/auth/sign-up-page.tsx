"use client"

import { useSignUp } from "@clerk/nextjs"
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
import { signupSchema, verificationSchema } from "@/schemas/auth"
import { type SignupFormProps, type SignupFormValues } from "@/types/auth"

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
    if (!fetchStatus) {
      return
    }

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
      className={cn("flex flex-col gap-6", className)}
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
            Create your Vouch account
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
            Create Vouches, accept commitment links, and manage setup for payment-backed
            confirmation.
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

        {awaitingVerification ? (
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
                Confirm your email to finish account creation.
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
                disabled={isBusy}
                variant="outline"
                className="h-12 border border-neutral-700 bg-neutral-900 text-neutral-100 transition-all duration-300 hover:border-blue-600 hover:bg-neutral-950"
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendVerificationCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              disabled={isBusy}
              variant="ghost"
              className="w-full border border-neutral-700 bg-neutral-900 text-neutral-100 transition-all duration-300 hover:border-blue-600 hover:bg-neutral-950"
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
              {isResetting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start over
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel className="text-neutral-100" htmlFor="firstName">
                  First name
                </FieldLabel>

                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                  disabled={isBusy}
                  {...form.register("firstName", {
                    setValueAs: (value: string) =>
                      typeof value === "string" ? value.trim() : "",
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
                <FieldLabel className="text-neutral-100" htmlFor="lastName">
                  Last name
                </FieldLabel>

                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                  disabled={isBusy}
                  {...form.register("lastName", {
                    setValueAs: (value: string) =>
                      typeof value === "string" ? value.trim() : "",
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-12 border-neutral-800 bg-neutral-900 px-3 text-neutral-50 placeholder:text-neutral-500"
                disabled={isBusy}
                {...form.register("password")}
              />

              <FieldDescription className="text-neutral-400">
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

            <Button
              type="submit"
              disabled={isBusy}
              className="flex h-12 w-full items-center gap-2 bg-blue-600 text-xs font-semibold text-neutral-100 transition-all duration-300 hover:border-2 hover:border-blue-600 hover:bg-transparent hover:text-blue-400 sm:text-sm"
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create account
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-neutral-400">
              <span>Already have an account?</span>

              <Link
                href={
                  redirectUrl
                    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-in"
                }
                className="font-medium text-blue-500 transition hover:text-blue-300"
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
