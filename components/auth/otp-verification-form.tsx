type OTPVerificationFormProps = {
  logo?: React.ReactNode
  title?: string
  description?: string
  email?: string
  length?: number
  value?: string
  notice?: string | null
  error?: string | undefined
  rootError?: string | undefined
  disabled?: boolean
  submitLabel?: string
  resendLabel?: string
  backLabel?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onResend?: () => void
  onBackToLogin?: () => void
  isSubmitting?: boolean
  isResending?: boolean
  isResetting?: boolean
  actions?: React.ReactNode
}

import * as React from "react"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authFormContent } from "@/content/auth"

export function OTPVerificationForm({
  logo,
  title = authFormContent.verification.title,
  description,
  email,
  length = 6,
  value = "123456",
  notice,
  error,
  rootError,
  disabled = false,
  submitLabel = authFormContent.verification.submitLabel,
  resendLabel = authFormContent.verification.resendLabel,
  backLabel = authFormContent.verification.backLabel,
  onChange,
  onSubmit,
  onResend,
  onBackToLogin,
  isSubmitting = false,
  isResending = false,
  isResetting = false,
  actions,
}: OTPVerificationFormProps) {
  const digits = value.padEnd(length).slice(0, length).split("")
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  function commitDigits(nextDigits: string[]) {
    onChange?.(nextDigits.join(""))
  }

  function updateDigit(index: number, rawValue: string) {
    const nextDigit = rawValue.replace(/\D/g, "").slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = nextDigit
    commitDigits(nextDigits)

    if (nextDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()

    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    const nextDigits = Array.from({ length }, (_, index) => pastedDigits[index] ?? "")
    commitDigits(nextDigits)
    inputRefs.current[Math.min(pastedDigits.length, length - 1)]?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="rounded-none border-3 border-neutral-400 bg-black shadow-vouch-lg">
        <CardHeader className="space-y-4 px-5 py-6 text-center sm:px-6">
          <div className="mx-auto">
            {logo ?? (
              <Link href="/" aria-label={authFormContent.homeAriaLabel} className="inline-flex">
                <LogoLockup
                  className="justify-center"
                  iconClassName="size-10 sm:size-12"
                  textClassName="text-4xl sm:text-5xl lg:text-6xl"
                />
              </Link>
            )}
          </div>
          <div>
            <CardTitle className="text-3xl leading-none font-black uppercase sm:text-4xl">
              {title}
            </CardTitle>
            <CardDescription className="mt-2">
              {description ||
                `We sent a ${length}-digit code to ${email || authFormContent.verification.emailFallback}. Enter it below.`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-5 pb-6 sm:px-6">
          {notice ? (
            <div className="border-3 border-blue-600 bg-blue-600/10 px-4 py-3 text-sm text-white">
              {notice}
            </div>
          ) : null}
          {rootError ? (
            <div className="border-3 border-red-600 bg-red-600/10 px-4 py-3 text-sm text-white">
              {rootError}
            </div>
          ) : null}
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <Input
                key={`otp-digit-${index}`}
                ref={(node) => {
                  inputRefs.current[index] = node
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={authFormContent.verification.digitLabel
                  .replace("{index}", String(index + 1))
                  .replace("{length}", String(length))}
                value={digit}
                onChange={(event) => {
                  updateDigit(index, event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !digits[index] && index > 0) {
                    inputRefs.current[index - 1]?.focus()
                  }
                }}
                onPaste={handlePaste}
                readOnly={!onChange}
                disabled={disabled}
                className="h-14 w-11 rounded-none border-2 border-neutral-400 bg-black text-center text-2xl font-black text-white caret-white shadow-none selection:bg-blue-600 selection:text-white focus-visible:border-blue-600 sm:w-12"
              />
            ))}
          </div>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          {actions ?? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={disabled || digits.some((digit) => digit.trim() === "")}
                onClick={() => onSubmit?.(value)}
              >
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {submitLabel}
              </Button>

              {onResend ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={disabled}
                  onClick={onResend}
                >
                  {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {resendLabel}
                </Button>
              ) : null}

              {onBackToLogin ? (
                <Button
                  type="button"
                  variant="link"
                  disabled={disabled}
                  className="sm:col-span-2"
                  onClick={onBackToLogin}
                >
                  {isResetting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {backLabel}
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
