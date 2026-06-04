import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, LoaderCircle } from "lucide-react"
import { LogoLockup } from "@/components/nav/logo-lockup"

export function LoginForm({
  description = "sign in to manage your account",
  notice,
  error,
  footer,
  signUpHref,
  signUpPrompt = "Need an account?",
  signUpLabel = "Sign Up",
  emailInputProps,
  passwordInputProps,
  emailError,
  passwordError,
  disabled = false,
  isSubmitting = false,
  submitLabel = "Sign in",
}: LoginFormProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-8 text-center">
          <div>
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
              <LogoLockup className="mt-12 scale-200" />
            </Link>
            <CardDescription className="mt-6 mb-6 text-lg uppercase">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notice ? (
              <div className="border-3 border-blue-600 bg-blue-600/10 px-4 py-3 text-sm text-white">
                {notice}
              </div>
            ) : null}
            {error ? (
              <div className="border-3 border-red-600 bg-red-600/10 px-4 py-3 text-sm text-white">
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              <Label htmlFor="email" className="text-sm uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                disabled={disabled}
                {...emailInputProps}
                className="h-12 border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] placeholder:text-neutral-400"
              />
              {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
            </div>

            <div className="space-y-4">
              <Label htmlFor="password" className="text-sm uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={disabled}
                {...passwordInputProps}
                className="h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]"
              />
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            </div>

            <Button type="submit" disabled={disabled} className="mt-4 w-full" size="lg">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>

            {(footer ?? signUpHref) ? (
              <div className="text-center text-sm text-neutral-400">
                {footer ?? (
                  <span>
                    {signUpPrompt}{" "}
                    <Button asChild variant="nav" size="nav">
                      <Link href={signUpHref ?? "#"}>{signUpLabel}</Link>
                    </Button>
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SignUpForm({
  description = "create an account to use Vouch",
  notice,
  error,
  footer,
  signInHref,
  signInPrompt = "Already have an account?",
  signInLabel = "Login",
  firstNameInputProps,
  lastNameInputProps,
  emailInputProps,
  passwordInputProps,
  firstNameError,
  lastNameError,
  emailError,
  passwordError,
  agreementError,
  agreementChecked,
  agreementLabel,
  onAgreementChange,
  disabled = false,
  isSubmitting = false,
  submitLabel = "Create account",
  captcha,
}: SignUpFormProps) {
  const inputClassName =
    "h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] placeholder:text-neutral-400"

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-8 text-center">
          <div>
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
              <LogoLockup className="mt-12 scale-200" />
            </Link>
            <CardDescription className="mt-6 mb-6 text-lg uppercase">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notice ? (
              <div className="border-3 border-blue-600 bg-blue-600/10 px-4 py-3 text-sm text-white">
                {notice}
              </div>
            ) : null}
            {error ? (
              <div className="border-3 border-red-600 bg-red-600/10 px-4 py-3 text-sm text-white">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <Label htmlFor="firstName" className="text-sm uppercase">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  disabled={disabled}
                  {...firstNameInputProps}
                  className={inputClassName}
                />
                {firstNameError ? <p className="text-sm text-red-600">{firstNameError}</p> : null}
              </div>

              <div className="space-y-4">
                <Label htmlFor="lastName" className="text-sm uppercase">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  disabled={disabled}
                  {...lastNameInputProps}
                  className={inputClassName}
                />
                {lastNameError ? <p className="text-sm text-red-600">{lastNameError}</p> : null}
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="signup-email" className="text-sm uppercase">
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                disabled={disabled}
                {...emailInputProps}
                className={inputClassName}
              />
              {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
            </div>

            <div className="space-y-4">
              <Label htmlFor="signup-password" className="text-sm uppercase">
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={disabled}
                {...passwordInputProps}
                className={inputClassName}
              />
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={agreementChecked ?? false}
                  aria-invalid={Boolean(agreementError)}
                  disabled={disabled}
                  onCheckedChange={(checked) => onAgreementChange?.(checked === true)}
                />
                <span className="text-sm font-semibold text-neutral-400">{agreementLabel}</span>
              </div>
              {agreementError ? <p className="text-base text-red-600">{agreementError}</p> : null}
            </div>

            {captcha}

            <Button type="submit" disabled={disabled} className="w-full" size="lg">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>

            {(footer ?? signInHref) ? (
              <div className="text-center text-sm text-neutral-400">
                {footer ?? (
                  <span>
                    {signInPrompt}{" "}
                    <Button asChild variant="nav" size="nav">
                      <Link href={signInHref ?? "#"}>{signInLabel}</Link>
                    </Button>
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ForgotPasswordForm({
  logo,
  title = "Forgot password?",
  description = "No worries, we'll send you reset instructions.",
  onBackToLogin,
}: ForgotPasswordFormProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4 text-center">
          {logo && <div className="mx-auto">{logo}</div>}
          <div>
            <CardTitle className="text-4xl font-black uppercase md:text-5xl lg:text-6xl">
              {title}
            </CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm uppercase">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-2 border-neutral-400 pl-10"
                  defaultValue="you@example.com"
                  readOnly
                  required
                />
              </div>
            </div>

            <Button type="button" className="w-full" size="lg">
              Send Reset Link
            </Button>

            {onBackToLogin && (
              <Button type="button" variant="outline" className="w-full">
                Back to login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function OTPVerificationForm({
  logo,
  title = "Verify your email",
  description,
  email,
  length = 6,
  value = "123456",
  notice,
  error,
  rootError,
  disabled = false,
  submitLabel = "Verify",
  resendLabel = "Resend code",
  backLabel = "Start over",
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
    onChange?.(nextDigits.join("").trim())
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
      <Card className="rounded-none border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <CardHeader className="space-y-4 px-5 py-6 text-center sm:px-6">
          <div className="mx-auto">
            {logo ?? (
              <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
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
                `We sent a ${length}-digit code to ${email || "your email"}. Enter it below.`}
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
                aria-label={`Digit ${index + 1} of ${length}`}
                value={digit}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  updateDigit(index, event.target.value)
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
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
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

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

// ============================================================================
// Export all variants
// ============================================================================
export const AuthForms = {
  Login: LoginForm,
  SignUp: SignUpForm,
  ForgotPassword: ForgotPasswordForm,
  OTPVerification: OTPVerificationForm,
}
