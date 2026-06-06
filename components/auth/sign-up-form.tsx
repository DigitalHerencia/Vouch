import Link from "next/link"
import { LoaderCircle } from "lucide-react"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
