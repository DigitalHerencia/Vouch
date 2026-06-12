type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: string | null
  error?: string | null | undefined
  children?: React.ReactNode
  footer?: React.ReactNode
  signUpHref?: string
  signUpPrompt?: string
  signUpLabel?: string
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: string[]
  emailInputProps?: React.ComponentPropsWithoutRef<"input">
  passwordInputProps?: React.ComponentPropsWithoutRef<"input">
  emailError?: string | undefined
  passwordError?: string | undefined
  passwordDescription?: string
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
}

type SignUpFormProps = LoginFormProps & {
  signInHref?: string
  signInPrompt?: string
  signInLabel?: string
  onSignIn?: () => void
  termsUrl?: string
  privacyUrl?: string
  firstNameInputProps?: React.ComponentPropsWithoutRef<"input">
  lastNameInputProps?: React.ComponentPropsWithoutRef<"input">
  firstNameError?: string | undefined
  lastNameError?: string | undefined
  agreementError?: string | undefined
  agreementChecked?: boolean | undefined
  agreementLabel?: React.ReactNode
  onAgreementChange?: (checked: boolean) => void
  captcha?: React.ReactNode
}

import Link from "next/link"
import { LoaderCircle } from "lucide-react"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authFormContent } from "@/content/auth"

export function SignUpForm({
  description = authFormContent.signUp.description,
  notice,
  error,
  footer,
  signInHref,
  signInPrompt = authFormContent.signUp.signInPrompt,
  signInLabel = authFormContent.signUp.signInLabel,
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
  submitLabel = authFormContent.signUp.submitLabel,
  captcha,
}: SignUpFormProps) {
  const inputClassName =
    "h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-vouch-sm placeholder:text-neutral-400"

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-8 text-center">
          <div>
            <Link href="/" aria-label={authFormContent.homeAriaLabel} className="inline-flex">
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
                  {authFormContent.signUp.firstNameLabel}
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder={authFormContent.signUp.firstNamePlaceholder}
                  disabled={disabled}
                  {...firstNameInputProps}
                  className={inputClassName}
                />
                {firstNameError ? <p className="text-sm text-red-600">{firstNameError}</p> : null}
              </div>

              <div className="space-y-4">
                <Label htmlFor="lastName" className="text-sm uppercase">
                  {authFormContent.signUp.lastNameLabel}
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder={authFormContent.signUp.lastNamePlaceholder}
                  disabled={disabled}
                  {...lastNameInputProps}
                  className={inputClassName}
                />
                {lastNameError ? <p className="text-sm text-red-600">{lastNameError}</p> : null}
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="signup-email" className="text-sm uppercase">
                {authFormContent.signUp.emailLabel}
              </Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder={authFormContent.signUp.emailPlaceholder}
                disabled={disabled}
                {...emailInputProps}
                className={inputClassName}
              />
              {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
            </div>

            <div className="space-y-4">
              <Label htmlFor="signup-password" className="text-sm uppercase">
                {authFormContent.signUp.passwordLabel}
              </Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder={authFormContent.signUp.passwordPlaceholder}
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
