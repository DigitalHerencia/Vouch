import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authFormContent } from "@/content/auth"

type LoginFormProps = ComponentPropsWithoutRef<"form"> & {
  description?: string
  notice?: string | null
  error?: string | null | undefined
  footer?: ReactNode
  signUpHref?: string
  signUpPrompt?: string
  signUpLabel?: string
  emailInputProps?: ComponentPropsWithoutRef<"input">
  passwordInputProps?: ComponentPropsWithoutRef<"input">
  emailError?: string | undefined
  passwordError?: string | undefined
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
}

export function LoginForm({
  description = authFormContent.login.description,
  notice,
  error,
  footer,
  signUpHref,
  signUpPrompt = authFormContent.login.signUpPrompt,
  signUpLabel = authFormContent.login.signUpLabel,
  emailInputProps,
  passwordInputProps,
  emailError,
  passwordError,
  disabled = false,
  isSubmitting = false,
  submitLabel = authFormContent.login.submitLabel,
}: LoginFormProps) {
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
          <div className="space-y-6">
            {notice ? (
              <div
                className="border-3 border-blue-600 bg-blue-600/10 px-4 py-3 text-sm text-white"
                role="status"
              >
                {notice}
              </div>
            ) : null}
            {error ? (
              <div
                className="border-3 border-red-600 bg-red-600/10 px-4 py-3 text-sm text-white"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              <Label htmlFor="email" className="text-sm uppercase">
                {authFormContent.login.emailLabel}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={authFormContent.login.emailPlaceholder}
                disabled={disabled}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                {...emailInputProps}
                className="h-12 border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-vouch-sm placeholder:text-neutral-400"
              />
              {emailError ? (
                <p id="email-error" className="text-sm text-red-600">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              <Label htmlFor="password" className="text-sm uppercase">
                {authFormContent.login.passwordLabel}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={authFormContent.login.passwordPlaceholder}
                disabled={disabled}
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? "password-error" : undefined}
                {...passwordInputProps}
                className="h-12 rounded-none border-3 border-neutral-400 bg-black px-4 text-base font-semibold text-white shadow-vouch-sm"
              />
              {passwordError ? (
                <p id="password-error" className="text-sm text-red-600">
                  {passwordError}
                </p>
              ) : null}
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
