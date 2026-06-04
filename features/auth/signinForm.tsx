"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { LoginForm as LoginBlock } from "@/components/auth/login-form"
import { OTPVerificationForm } from "@/components/auth/otp-verification-form"
import { authVerificationContent } from "@/content/auth"
import { ensureLocalUserForCurrentSession } from "@/lib/actions/authActions"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { loginSchema, verificationSchema } from "@/schemas/authSchemas"
import { type LoginFormProps, type LoginFormValues } from "@/types/authTypes"

function getErrorMessage(error: unknown, fallback: string): string {
  const clerkError = error as { errors?: Array<{ message?: string }> }
  const firstMessage = clerkError.errors?.[0]?.message

  return typeof firstMessage === "string" && firstMessage.trim().length > 0
    ? firstMessage
    : fallback
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
  const isBusy =
    form.formState.isSubmitting || isResending || isResetting || fetchStatus === "fetching"
  const rootError = form.formState.errors.root?.message

  async function finalizeAndRedirect(): Promise<boolean> {
    const finalizeResult = await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          form.setError("root", {
            message: "Finish the required account step before continuing.",
          })
          return
        }

        const localUserResult = await ensureLocalUserForCurrentSession()

        if (!localUserResult.ok) {
          form.setError("root", {
            message: "Unable to sync your Vouch account. Try again.",
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

      form.setError("root", { message: "Sign-in requires an unsupported account step." })
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error, "Invalid email or password."),
      })
    }
  })

  return (
    <form onSubmit={handleSubmit} noValidate {...props}>
      {awaitingSecondFactor ? (
        <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-16">
          <OTPVerificationForm
            title={authVerificationContent.codeLabel}
            description={
              secondFactorMethod === "phone_code"
                ? authVerificationContent.latestCodePhone
                : authVerificationContent.latestCodeEmail
            }
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
                await sendSecondFactorCode()
              })
            }}
            onBackToLogin={() => {
              startResetting(async () => {
                await signIn.reset()
                setAwaitingSecondFactor(false)
                setSecondFactorMethod(null)
                setNotice(null)
                form.clearErrors()
                form.reset({
                  email: form.getValues("email"),
                  password: "",
                  verificationCode: "",
                })
              })
            }}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-dvh items-center justify-center px-12 py-24">
          <LoginBlock
            description="sign in to manage your account"
            notice={notice}
            error={rootError}
            signUpHref={
              redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"
            }
            emailInputProps={form.register("email", {
              setValueAs: (value: string) =>
                typeof value === "string" ? value.trim().toLowerCase() : "",
            })}
            passwordInputProps={form.register("password")}
            emailError={form.formState.errors.email?.message}
            passwordError={form.formState.errors.password?.message}
            disabled={isBusy}
            isSubmitting={form.formState.isSubmitting}
            submitLabel="Sign in"
          />
        </div>
      )}
    </form>
  )
}
