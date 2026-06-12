import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
