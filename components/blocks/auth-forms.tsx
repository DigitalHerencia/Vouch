import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Mail, Lock, User, ArrowRight } from "lucide-react"

// ============================================================================
// AUTH VARIANT 1: Login Form
// ============================================================================
export interface LoginFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: Array<"google" | "github">
}

export function LoginForm({
  logo,
  title = "Welcome back",
  description = "Enter your credentials to access your account",
  onForgotPassword,
  onSignUp,
  socialProviders,
}: LoginFormProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4 text-center">
          {logo && <div className="mx-auto">{logo}</div>}
          <div>
            <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
              <ArrowRight className="ml-2 h-4 w-4" />
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
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  )}
                  {socialProviders.includes("github") && (
                    <Button variant="outline" type="button">
                      <ArrowRight className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
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
  onSignIn,
  socialProviders,
  termsUrl = "#",
  privacyUrl = "#",
}: SignUpFormProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4 text-center">
          {logo && <div className="mx-auto">{logo}</div>}
          <div>
            <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
                  <Link href={termsUrl} className="font-bold text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href={privacyUrl} className="font-bold text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button type="button" className="w-full" size="lg">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
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
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  )}
                  {socialProviders.includes("github") && (
                    <Button variant="outline" type="button">
                      <ArrowRight className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
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
            <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
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
              <ArrowRight className="ml-2 h-4 w-4" />
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
  error?: string | undefined
  disabled?: boolean
  submitLabel?: string
  onChange?: (otp: string) => void
  onSubmit?: (otp: string) => void
  onResend?: () => void
  onBackToLogin?: () => void
}

export function OTPVerificationForm({
  logo,
  title = "Verify your email",
  description,
  email,
  length = 6,
  value = "123456",
  error,
  disabled = false,
  submitLabel = "Verify",
  onResend,
  onBackToLogin,
}: OTPVerificationFormProps) {
  const digits = value.padEnd(length).slice(0, length).split("")

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4 text-center">
          {logo && <div className="mx-auto">{logo}</div>}
          <div>
            <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
            <CardDescription className="mt-2">
              {description ||
                `We sent a ${length}-digit code to ${email || "your email"}. Enter it below.`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {digits.map((digit, index) => (
              <Input
                key={`otp-digit-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${index + 1} of ${length}`}
                value={digit}
                readOnly
                disabled={disabled}
                className="h-14 w-12 border-2 border-neutral-400 text-center text-2xl font-black"
              />
            ))}
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={disabled || digits.some((digit) => digit.trim() === "")}
          >
            {submitLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="space-y-2 text-center">
            {onResend && (
              <p className="text-sm text-neutral-400">
                Didn't receive a code?{" "}
                <Button type="button" variant="link" size="nav">
                  Resend
                </Button>
              </p>
            )}
            {onBackToLogin && (
              <Button type="button" variant="ghost" size="sm">
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
  SignUp: SignUpForm,
  ForgotPassword: ForgotPasswordForm,
  OTPVerification: OTPVerificationForm,
  SplitLayout: AuthSplitLayout,
}
