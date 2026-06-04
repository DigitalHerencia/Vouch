"use client"

import { useSignUp } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { OTPVerificationForm, SignUpForm as SignUpBlock } from "@/components/shared/auth-forms"
import { Button } from "@/components/shared/button"
import { authVerificationContent } from "@/content/auth"
import { completeSignUpWithTermsAcceptance } from "@/lib/actions/authActions"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { signupSchema, verificationSchema } from "@/schemas/authSchemas"
import { type SignupFormProps, type SignupFormValues } from "@/types/authTypes"

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
  const verificationCode = useWatch({
    control: form.control,
    name: "verificationCode",
  })

  const nextUrl = sanitizePostAuthRedirect(redirectUrl)
  const isBusy =
    form.formState.isSubmitting || isResending || isResetting || fetchStatus === "fetching"
  const rootError = form.formState.errors.root?.message

  async function finalizeAndRedirect(): Promise<boolean> {
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

    const termsResult = await completeSignUpWithTermsAcceptance({
      acceptedUserAgreement: form.getValues("acceptedUserAgreement"),
    })

    if (!termsResult.ok) {
      form.setError("root", {
        message:
          "message" in termsResult
            ? termsResult.message
            : "Unable to record User Agreement acceptance.",
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

    setNotice(authVerificationContent.sentToEmailHeading)
    return true
  }

  const handleSubmit = form.handleSubmit(async (values) => {
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
          message: `Verification is not complete yet (status: ${signUp.status}).`,
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

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        const sent = await sendVerificationCode()

        if (sent) {
          setAwaitingVerification(true)
          form.resetField("verificationCode")
        }

        return
      }

      form.setError("root", {
        message: "Sign-up requires an unsupported account step.",
      })
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Sign up failed. Please try again."),
      })
    }
  })

  return (
    <div className="relative z-10 grid min-h-dvh place-items-center p-4 sm:p-6 lg:p-8">
      <form className="w-full max-w-md" onSubmit={handleSubmit} noValidate {...props}>
        {awaitingVerification ? (
          <OTPVerificationForm
            title={authVerificationContent.codeLabel}
            description={authVerificationContent.finishSignup}
            length={6}
            value={verificationCode}
            notice={notice}
            error={form.formState.errors.verificationCode?.message}
            rootError={rootError}
            disabled={isBusy}
            submitLabel={authVerificationContent.verifyCode}
            resendLabel={authVerificationContent.resendCode}
            backLabel={authVerificationContent.startOver}
            isSubmitting={form.formState.isSubmitting}
            isResending={isResending}
            isResetting={isResetting}
            onChange={(code: string) =>
              form.setValue("verificationCode", code, {
                shouldDirty: true,
                shouldValidate: code.length === 6,
              })
            }
            onResend={() => {
              startResending(async () => {
                form.clearErrors("root")
                setNotice(null)
                await sendVerificationCode()
              })
            }}
            onBackToLogin={() => {
              startResetting(async () => {
                await signUp.reset()
                setAwaitingVerification(false)
                setNotice(null)
                form.clearErrors()
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
          />
        ) : (
          <SignUpBlock
            description="create an account to use Vouch"
            notice={notice}
            error={rootError}
            signInHref={
              redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-in"
            }
            firstNameInputProps={form.register("firstName", {
              setValueAs: (value: string) => (typeof value === "string" ? value.trim() : ""),
            })}
            lastNameInputProps={form.register("lastName", {
              setValueAs: (value: string) => (typeof value === "string" ? value.trim() : ""),
            })}
            emailInputProps={form.register("email", {
              setValueAs: (value: string) =>
                typeof value === "string" ? value.trim().toLowerCase() : "",
            })}
            passwordInputProps={form.register("password")}
            firstNameError={form.formState.errors.firstName?.message}
            lastNameError={form.formState.errors.lastName?.message}
            emailError={form.formState.errors.email?.message}
            passwordError={form.formState.errors.password?.message}
            agreementError={form.formState.errors.acceptedUserAgreement?.message}
            agreementChecked={acceptedUserAgreement}
            agreementLabel={
              <>
                I agree to the
                <Button asChild variant="nav" size="nav" className="ml-3">
                  <Link href="/legal/user-agreement" target="_blank" rel="noreferrer">
                    User Agreement
                  </Link>
                </Button>
                .
              </>
            }
            onAgreementChange={(checked: boolean) => {
              form.setValue("acceptedUserAgreement", checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
            disabled={isBusy}
            isSubmitting={form.formState.isSubmitting}
            submitLabel="Create account"
            captcha={<div id="clerk-captcha" className="min-h-0 w-full overflow-hidden" />}
          />
        )}
      </form>
    </div>
  )
}
