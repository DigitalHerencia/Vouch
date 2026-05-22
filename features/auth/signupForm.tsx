// features/auth/sign-up-page.tsx

"use client"

import { useSignUp } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { AuthForms } from "@/components/blocks/auth-forms"
import { SignUp } from "@/components/forms/sign-up"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup as UiFieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authVerificationContent } from "@/content/auth"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { signupSchema, verificationSchema } from "@/schemas/auth"
import { type SignupFormProps, type SignupFormValues } from "@/types/auth"

const inputClassName =
  "h-10 w-full min-w-0 rounded-none border border-neutral-400 bg-black px-3.5 font-(family-name:--font-sans) text-sm font-semibold text-white shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-blue-600 focus-visible:ring-0 sm:h-11 sm:px-4 lg:h-12"

export function SignUpFeature({ redirectUrl }: { redirectUrl?: string | undefined }) {
  return <SignUpForm redirectUrl={redirectUrl} />
}

function getErrorMessage(error: unknown, fallback: string): string {
  const clerkError = error as { errors?: Array<{ message?: string }> }
  const firstMessage = clerkError.errors?.[0]?.message

  return typeof firstMessage === "string" && firstMessage.trim().length > 0
    ? firstMessage
    : fallback
}

export function SignUpForm({ redirectUrl, ...props }: SignupFormProps) {
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
      acceptedUserAgreement: false,
    },
  })

  const acceptedUserAgreement = useWatch({
    control: form.control,
    name: "acceptedUserAgreement",
  })

  const nextUrl = sanitizePostAuthRedirect(redirectUrl)
  const isBusy = form.formState.isSubmitting || isResending || isResetting || !fetchStatus
  const rootError = form.formState.errors.root?.message

  async function finalizeAndRedirect(): Promise<boolean> {
    const finalizeResult = await signUp.finalize()

    if (finalizeResult.error) {
      form.setError("root", {
        message: finalizeResult.error.message || "Unable to finalize sign-up.",
      })
      return false
    }

    router.push(nextUrl)
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

    setNotice(authVerificationContent.sentToEmailHeading)
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

        await finalizeAndRedirect()
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
              field === "password" ||
              field === "acceptedUserAgreement")
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
        message: "Sign-up encountered an unexpected state. Please try again.",
      })
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Sign up failed. Please try again."),
      })
    }
  })

  return (
    <form
      className="flex w-full max-w-full min-w-0 flex-col overflow-hidden bg-black text-white"
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <UiFieldGroup className="max-w-full min-w-0 gap-2.5 overflow-hidden border-0 bg-black p-0 shadow-none sm:gap-3">
        {notice ? (
          <h1 className="max-w-full overflow-hidden font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] wrap-break-word text-white uppercase sm:text-[40px] lg:text-[48px]">
            {notice}
          </h1>
        ) : null}

        {rootError ? (
          <>
            <Alert variant="destructive">
              <AlertTitle>Sign-up blocked</AlertTitle>
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
            <AlertDialog open>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign-up needs attention</AlertDialogTitle>
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

        {awaitingVerification ? (
          <div className="max-w-full min-w-0 space-y-3 overflow-hidden">
            <AuthForms.OTPVerification
              title={authVerificationContent.codeLabel}
              description={authVerificationContent.finishSignup}
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
            />

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                disabled={isBusy}
                variant="secondary"
                size="lg"
                className="w-full min-w-0"
                onClick={() => {
                  startResending(async () => {
                    form.clearErrors("root")
                    setNotice(null)
                    await sendVerificationCode()
                  })
                }}
              >
                {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {authVerificationContent.resendCode}
              </Button>

              <Button
                type="button"
                disabled={isBusy}
                variant="ghost"
                size="lg"
                className="w-full min-w-0"
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
                      acceptedUserAgreement: form.getValues("acceptedUserAgreement"),
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
                size="lg"
                className="w-full min-w-0 sm:col-span-2"
              >
                {authVerificationContent.verifyCode}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-full min-w-0 space-y-2.5 overflow-hidden sm:space-y-3">
            <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 sm:gap-3">
              <SignUp
                id="firstName"
                label="First name"
                error={form.formState.errors.firstName?.message}
              >
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
              </SignUp>

              <SignUp
                id="lastName"
                label="Last name"
                error={form.formState.errors.lastName?.message}
              >
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
              </SignUp>
            </div>

            <SignUp id="email" label="Email" error={form.formState.errors.email?.message}>
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
            </SignUp>

            <SignUp
              id="password"
              label="Password"
              description="Use a strong password you have not used elsewhere."
              error={form.formState.errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={inputClassName}
                disabled={isBusy}
                {...form.register("password")}
              />
            </SignUp>

            <Field data-invalid={Boolean(form.formState.errors.acceptedUserAgreement?.message)}>
              <label className="flex min-w-0 items-start gap-2.5 overflow-hidden border border-neutral-400 bg-black p-3">
                <Checkbox
                  className="mt-1 shrink-0 rounded-none"
                  checked={acceptedUserAgreement}
                  aria-invalid={Boolean(form.formState.errors.acceptedUserAgreement?.message)}
                  disabled={isBusy}
                  onCheckedChange={(checked) => {
                    form.setValue("acceptedUserAgreement", checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                />

                <span className="min-w-0 text-[11px] leading-4 font-semibold wrap-break-word text-neutral-400 sm:text-xs sm:leading-5">
                  I agree to the{" "}
                  <Link
                    href="/user-agreement"
                    className="text-blue-600 underline-offset-4 hover:underline"
                  >
                    User Agreement
                  </Link>
                  ,{" "}
                  <Link href="/terms" className="text-blue-600 underline-offset-4 hover:underline">
                    Terms of Service
                  </Link>
                  , and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . I understand Vouch is a neutral payment coordination tool for deterministic
                  outcomes only.
                </span>
              </label>

              <FieldError
                {...(form.formState.errors.acceptedUserAgreement?.message
                  ? {
                      errors: [{ message: form.formState.errors.acceptedUserAgreement.message }],
                    }
                  : {})}
              />
            </Field>

            <div id="clerk-captcha" className="min-h-0 w-full max-w-full overflow-hidden" />

            <Button type="submit" disabled={isBusy} size="lg" className="w-full min-w-0">
              Create account
            </Button>

            <div className="flex min-w-0 flex-wrap items-center gap-2 overflow-hidden text-xs font-semibold text-neutral-400 sm:text-sm">
              <span>Already have an account?</span>
              <Link
                href={
                  redirectUrl
                    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                    : "/sign-in"
                }
                className="font-mono text-blue-600 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </UiFieldGroup>
    </form>
  )
}
