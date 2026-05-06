// features/auth/sign-in-page.tsx

"use client"

import { useSignIn } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { FieldGroup } from "@/components/forms/field-group"
import { SubmitButton } from "@/components/forms/submit-button"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup as UiFieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { cn } from "@/lib/utils"
import { loginSchema, verificationSchema } from "@/schemas/auth"
import { type LoginFormProps, type LoginFormValues } from "@/types/auth"

const inputClassName =
  "h-11 w-full min-w-0 rounded-none border border-neutral-700 bg-black/55 px-4 font-(family-name:--font-sans) text-sm font-semibold text-white shadow-none outline-none placeholder:text-neutral-600 focus-visible:border-primary focus-visible:ring-0 sm:h-12 sm:text-base lg:h-13"

const labelClassName =
  "font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-white uppercase sm:text-base"

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
      className={cn(
        "flex w-full max-w-full min-w-0 flex-col overflow-hidden bg-transparent text-white",
        className
      )}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <UiFieldGroup className="max-w-full min-w-0 gap-3 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:gap-4">
        {notice ? (
          <div className="border-primary/70 bg-primary/10 max-w-full overflow-hidden border px-4 py-2.5 font-mono text-xs wrap-break-word text-blue-100 sm:text-sm">
            {notice}
          </div>
        ) : null}

        {form.formState.errors.root?.message ? (
          <div className="max-w-full overflow-hidden border border-red-900 bg-red-950/30 px-4 py-2.5 font-mono text-xs wrap-break-word text-red-100 sm:text-sm">
            {form.formState.errors.root.message}
          </div>
        ) : null}

        {awaitingSecondFactor ? (
          <div className="max-w-full min-w-0 space-y-3 overflow-hidden sm:space-y-4">
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

              <FieldDescription className="font-mono text-xs text-neutral-500">
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

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <SubmitButton
                disabled={isBusy}
                className="w-full min-w-0"
                size="cta"
                pendingLabel={
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Verify code
                  </>
                }
              >
                Verify code
              </SubmitButton>

              <Button
                type="button"
                variant="secondary"
                size="cta"
                disabled={isBusy}
                className="w-full min-w-0"
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendSecondFactorCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="cta"
              disabled={isBusy}
              className="w-full min-w-0"
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
              Start over
            </Button>
          </div>
        ) : (
          <div className="max-w-full min-w-0 space-y-3 overflow-hidden sm:space-y-4">
            <FieldGroup id="email" label="Email" error={form.formState.errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="digitalherencia@outlook.com"
                className={inputClassName}
                disabled={isBusy}
                {...form.register("email", {
                  setValueAs: (value: string) =>
                    typeof value === "string" ? value.trim().toLowerCase() : "",
                })}
              />
            </FieldGroup>

            <FieldGroup
              id="password"
              label="Password"
              error={form.formState.errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className={inputClassName}
                disabled={isBusy}
                {...form.register("password")}
              />
            </FieldGroup>

            <SubmitButton
              disabled={isBusy}
              size="cta"
              className="w-full min-w-0"
              pendingLabel={
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Sign in
                </>
              }
            >
              Sign in
            </SubmitButton>

            <div className="flex min-w-0 flex-wrap items-center gap-2 overflow-hidden text-xs font-semibold text-neutral-500 sm:text-sm">
              <span>Need an account?</span>
              <Link
                href={
                  redirectUrl
                    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-up"
                }
                className="text-primary font-mono underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Create one
              </Link>
            </div>
          </div>
        )}
      </UiFieldGroup>
    </form>
  )
}
