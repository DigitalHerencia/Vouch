// features/auth/sign-in-page.tsx

"use client"

import { useSignIn } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { AuthShell } from "@/components/auth/auth-shell"
import { AuthForms } from "@/components/blocks/auth-forms"
import { SignInFieldGroup } from "@/components/forms/sign-in-field-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { FieldGroup as UiFieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authVerificationContent } from "@/content/auth"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { cn } from "@/lib/utils"
import { loginSchema, verificationSchema } from "@/schemas/auth"
import { type LoginFormProps, type LoginFormValues } from "@/types/auth"

const inputClassName =
  "h-11 w-full min-w-0 rounded-none border border-neutral-700 bg-black/55 px-4 font-(family-name:--font-sans) text-sm font-semibold text-white shadow-none outline-none placeholder:text-neutral-600 focus-visible:border-primary focus-visible:ring-0 sm:h-12 sm:text-base lg:h-13"

export function SignInPageFeature({ redirectUrl }: { redirectUrl?: string | undefined }) {
  return <LoginForm redirectUrl={redirectUrl} />
}

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
          <h1 className="max-w-full overflow-hidden font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] wrap-break-word text-white uppercase sm:text-[40px] lg:text-[48px]">
            {notice}
          </h1>
        ) : null}

        {rootError ? (
          <>
            <Alert variant="destructive">
              <AlertTitle>Sign-in blocked</AlertTitle>
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
            <AlertDialog open>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign-in needs attention</AlertDialogTitle>
                  <AlertDialogDescription>{rootError}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction type="button" onClick={() => form.clearErrors("root")}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}

        {awaitingSecondFactor ? (
          <div className="max-w-full min-w-0 space-y-3 overflow-hidden sm:space-y-4">
            <AuthForms.OTPVerification
              title={authVerificationContent.codeLabel}
              description={
                secondFactorMethod === "phone_code"
                  ? authVerificationContent.latestCodePhone
                  : authVerificationContent.latestCodeEmail
              }
              length={6}
              value={form.watch("verificationCode")}
              error={form.formState.errors.verificationCode?.message}
              disabled={isBusy}
              submitLabel={authVerificationContent.verifyCode}
              onChange={(code) =>
                form.setValue("verificationCode", code, {
                  shouldDirty: true,
                  shouldValidate: code.length === 6,
                })
              }
              className="max-w-full"
            />

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
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
                {authVerificationContent.resendCode}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="lg"
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
                {authVerificationContent.startOver}
              </Button>

              <Button
                type="submit"
                disabled={isBusy}
                className="w-full min-w-0 sm:col-span-2"
                size="lg"
              >
                {authVerificationContent.verifyCode}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-full min-w-0 space-y-3 overflow-hidden sm:space-y-4">
            <SignInFieldGroup id="email" label="Email" error={form.formState.errors.email?.message}>
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
            </SignInFieldGroup>

            <SignInFieldGroup
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
            </SignInFieldGroup>

            <Button type="submit" disabled={isBusy} size="lg" className="w-full min-w-0">
              Sign in
            </Button>

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
