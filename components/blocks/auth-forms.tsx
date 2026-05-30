import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Mail, Lock, User, LoaderCircle } from "lucide-react"
import { LogoLockup } from "@/components/brand/logo-lockup"
import { AuthProcessPanelGrid } from "@/components/blocks/process-panel"

// ============================================================================
// AUTH VARIANT 1: Login Form
// ============================================================================
export interface LoginFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: React.ReactNode
  error?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  signUpHref?: string | undefined
  signUpPrompt?: string | undefined
  signUpLabel?: string | undefined
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: Array<"google" | "github">
}

export function LoginForm({
  logo,
  title,
  description,
  notice,
  error,
  children,
  footer,
  signUpHref,
  signUpPrompt = "Need an account?",
  signUpLabel = "Create one",
  onForgotPassword,
  onSignUp,
  socialProviders,
}: LoginFormProps) {
  const content = children ? (
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
      {children}
      {(footer ?? signUpHref) ? (
        <div className="text-center text-sm text-neutral-400">
          {footer ?? (
            <span>
              {signUpPrompt}{" "}
              <a
                href={signUpHref ?? "#"}
                className="text-blue-600 underline-offset-4 hover:text-white hover:underline"
              >
                {signUpLabel}
              </a>
            </span>
          )}
        </div>
      ) : null}
    </div>
  ) : null

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4 text-center">
          <div>
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
              <LogoLockup
                className="justify-center"
                iconClassName="size-10 sm:size-12"
                textClassName="text-[38px] sm:text-[48px] lg:text-[54px]"
              />
            </Link>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {content ?? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="border-2 border-neutral-400 pl-10"
                    defaultValue="you@example.com"
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="border-2 border-neutral-400 pr-10 pl-10"
                    defaultValue="password"
                    readOnly
                    required
                  />
                  <Button
                    type="button"
                    aria-label="Show password"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-neutral-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-medium">
                    Remember me
                  </Label>
                </div>
                {onForgotPassword && (
                  <Button type="button" variant="link" size="nav" className="text-sm">
                    Forgot password?
                  </Button>
                )}
              </div>

              <Button type="button" className="w-full" size="lg">
                Sign In
              </Button>

              {socialProviders && socialProviders.length > 0 && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-400" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 font-bold text-white">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {socialProviders.includes("google") && (
                      <Button variant="outline" type="button">
                        Google
                      </Button>
                    )}
                    {socialProviders.includes("github") && (
                      <Button variant="outline" type="button">
                        GitHub
                      </Button>
                    )}
                  </div>
                </>
              )}

              {onSignUp && (
                <p className="mt-4 text-center text-sm text-neutral-400">
                  Don't have an account?{" "}
                  <span>
                    <Button type="button" variant="link" size="nav">
                      Sign up
                    </Button>
                  </span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export interface LoginFormFieldsProps {
  emailInputProps: React.ComponentProps<typeof Input>
  passwordInputProps: React.ComponentProps<typeof Input>
  emailError?: string | undefined
  passwordError?: string | undefined
  passwordDescription?: string | undefined
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
}

export function LoginFormFields({
  emailInputProps,
  passwordInputProps,
  emailError,
  passwordError,
  passwordDescription = "Use your Vouch account password.",
  disabled = false,
  isSubmitting = false,
  submitLabel = "Sign in",
}: LoginFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-bold uppercase">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="m@example.com"
          disabled={disabled}
          {...emailInputProps}
          className="h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-blue-600 focus-visible:ring-0"
        />
        {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-bold uppercase">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={disabled}
          {...passwordInputProps}
          className="h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-blue-600 focus-visible:ring-0"
        />
        {passwordDescription ? (
          <p className="text-sm text-neutral-400">{passwordDescription}</p>
        ) : null}
        {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
      </div>

      <Button type="submit" disabled={disabled} className="w-full" size="lg">
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </div>
  )
}

// ============================================================================
// AUTH VARIANT 2: Sign Up Form
// ============================================================================
export interface SignUpFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: React.ReactNode
  error?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  signInHref?: string | undefined
  signInPrompt?: string | undefined
  signInLabel?: string | undefined
  onSubmit?: (data: { name: string; email: string; password: string; terms: boolean }) => void
  onSignIn?: () => void
  socialProviders?: Array<"google" | "github">
  termsUrl?: string
  privacyUrl?: string
}

export function SignUpForm({
  logo,
  title = "Create an account",
  description = "Enter your details to get started",
  notice,
  error,
  children,
  footer,
  signInHref,
  signInPrompt = "Already have an account?",
  signInLabel = "Sign in",
  onSignIn,
  socialProviders,
  termsUrl = "#",
  privacyUrl = "#",
}: SignUpFormProps) {
  const content = children ? (
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
      {children}
      {(footer ?? signInHref) ? (
        <div className="text-center text-sm text-neutral-400">
          {footer ?? (
            <span>
              {signInPrompt}{" "}
              <a
                href={signInHref ?? "#"}
                className="text-blue-600 underline-offset-4 hover:text-white hover:underline"
              >
                {signInLabel}
              </a>
            </span>
          )}
        </div>
      ) : null}
    </div>
  ) : null

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
          {content ?? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className="border-2 border-neutral-400 pl-10"
                    defaultValue="John Doe"
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs font-bold uppercase">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="border-2 border-neutral-400 pl-10"
                    defaultValue="you@example.com"
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs font-bold uppercase">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="border-2 border-neutral-400 pr-10 pl-10"
                    defaultValue="password"
                    readOnly
                    required
                  />
                  <Button
                    type="button"
                    aria-label="Show password"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-neutral-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-neutral-400">Must be at least 8 characters</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms" className="cursor-pointer text-sm leading-tight">
                    I agree to the{" "}
                    <a href={termsUrl} className="font-bold text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href={privacyUrl} className="font-bold text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </div>

              <Button type="button" className="w-full" size="lg">
                Create Account
              </Button>

              {socialProviders && socialProviders.length > 0 && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-neutral-400" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 font-bold text-neutral-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {socialProviders.includes("google") && (
                      <Button variant="outline" type="button">
                        Google
                      </Button>
                    )}
                    {socialProviders.includes("github") && (
                      <Button variant="outline" type="button">
                        GitHub
                      </Button>
                    )}
                  </div>
                </>
              )}

              {onSignIn && (
                <p className="mt-4 text-center text-sm text-neutral-400">
                  Already have an account?{" "}
                  <Button type="button" variant="link" size="nav">
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export interface SignUpFormFieldsProps {
  firstNameInputProps: React.ComponentProps<typeof Input>
  lastNameInputProps: React.ComponentProps<typeof Input>
  emailInputProps: React.ComponentProps<typeof Input>
  passwordInputProps: React.ComponentProps<typeof Input>
  firstNameError?: string | undefined
  lastNameError?: string | undefined
  emailError?: string | undefined
  passwordError?: string | undefined
  agreementError?: string | undefined
  agreementChecked: boolean
  agreementLabel: React.ReactNode
  onAgreementChange: (checked: boolean) => void
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
  captcha?: React.ReactNode
}

export function SignUpFormFields({
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
}: SignUpFormFieldsProps) {
  const inputClassName =
    "h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-blue-600 focus-visible:ring-0"

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-xs font-bold uppercase">
            First name
          </Label>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            disabled={disabled}
            {...firstNameInputProps}
            className={inputClassName}
          />
          {firstNameError ? <p className="text-sm text-red-600">{firstNameError}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-xs font-bold uppercase">
            Last name
          </Label>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            disabled={disabled}
            {...lastNameInputProps}
            className={inputClassName}
          />
          {lastNameError ? <p className="text-sm text-red-600">{lastNameError}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-xs font-bold uppercase">
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

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-xs font-bold uppercase">
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
        <p className="text-sm text-neutral-400">
          Use a strong password you have not used elsewhere.
        </p>
        {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 border-3 border-neutral-400 bg-black p-3">
          <Checkbox
            className="mt-1 shrink-0 rounded-none"
            checked={agreementChecked}
            aria-invalid={Boolean(agreementError)}
            disabled={disabled}
            onCheckedChange={(checked) => onAgreementChange(checked === true)}
          />
          <span className="text-xs leading-5 font-semibold text-neutral-400">{agreementLabel}</span>
        </label>
        {agreementError ? <p className="text-sm text-red-600">{agreementError}</p> : null}
      </div>

      {captcha}

      <Button type="submit" disabled={disabled} className="w-full" size="lg">
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </div>
  )
}

// ============================================================================
// AUTH VARIANT 3: Forgot Password Form
// ============================================================================
export interface ForgotPasswordFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  onSubmit?: (email: string) => void
  onBackToLogin?: () => void
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
              <Label htmlFor="reset-email" className="text-xs font-bold uppercase">
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

// ============================================================================
// AUTH VARIANT 4: OTP Verification Form
// ============================================================================
export interface OTPVerificationFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  email?: string
  length?: number
  value?: string
  notice?: React.ReactNode
  error?: string | undefined
  rootError?: React.ReactNode
  disabled?: boolean
  submitLabel?: string
  resendLabel?: string
  backLabel?: string
  onChange?: (otp: string) => void
  onSubmit?: (otp: string) => void
  onResend?: () => void
  onBackToLogin?: () => void
  isSubmitting?: boolean
  isResending?: boolean
  isResetting?: boolean
  actions?: React.ReactNode
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

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="rounded-none border-3 border-neutral-400 bg-transparent shadow-none">
        <CardHeader className="space-y-4 text-center">
          {logo && <div className="mx-auto">{logo}</div>}
          <div>
            <CardTitle className="text-4xl font-black uppercase md:text-5xl lg:text-6xl">
              {title}
            </CardTitle>
            <CardDescription className="mt-2">
              {description ||
                `We sent a ${length}-digit code to ${email || "your email"}. Enter it below.`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <div className="flex justify-center gap-2">
            {digits.map((digit, index) => (
              <Input
                key={`otp-digit-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${index + 1} of ${length}`}
                value={digit}
                onChange={(event) => {
                  const nextDigit = event.target.value.replace(/\D/g, "").slice(-1)
                  const nextDigits = [...digits]
                  nextDigits[index] = nextDigit
                  onChange?.(nextDigits.join("").trim())
                }}
                readOnly={!onChange}
                disabled={disabled}
                className="h-14 w-12 border-2 border-neutral-400 text-center text-2xl font-black"
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
// AUTH VARIANT 5: Split Auth Layout
// ============================================================================
export interface AuthSplitLayoutProps {
  children: React.ReactNode
  brandContent?: React.ReactNode
  position?: "left" | "right"
}

export function AuthSplitLayout({
  children,
  brandContent,
  position = "left",
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {position === "left" && brandContent && (
        <div className="hidden flex-col justify-center bg-blue-600 p-12 lg:flex lg:w-1/2">
          {brandContent}
        </div>
      )}

      <div className="flex flex-1 items-center justify-center p-4 md:p-8">{children}</div>

      {position === "right" && brandContent && (
        <div className="hidden flex-col justify-center bg-blue-600 p-12 lg:flex lg:w-1/2">
          {brandContent}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const AuthForms = {
  Login: LoginForm,
  LoginFields: LoginFormFields,
  SignUp: SignUpForm,
  SignUpFields: SignUpFormFields,
  ForgotPassword: ForgotPasswordForm,
  OTPVerification: OTPVerificationForm,
  SplitLayout: AuthSplitLayout,
}
