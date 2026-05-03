// features/auth/sign-up-page.tsx

"use client"

import { useSignUp } from "@clerk/nextjs"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"

import { FieldGroup } from "@/components/forms/field-group"
import { SubmitButton } from "@/components/forms/submit-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup as UiFieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sanitizePostAuthRedirect } from "@/lib/auth/redirects"
import { cn } from "@/lib/utils"
import { signupSchema, verificationSchema } from "@/schemas/auth"
import { type SignupFormProps, type SignupFormValues } from "@/types/auth"

const inputClassName =
    "h-14 rounded-none border border-neutral-700 bg-black/55 px-5 font-(family-name:--font-sans) text-base font-semibold text-white shadow-none outline-none placeholder:text-neutral-600 focus-visible:border-primary focus-visible:ring-0"

const labelClassName =
    "font-(family-name:--font-display) text-lg leading-none tracking-[0.08em] text-white uppercase"

function getErrorMessage(error: unknown, fallback: string): string {
    const clerkError = error as { errors?: Array<{ message?: string }> }
    const firstMessage = clerkError.errors?.[0]?.message

    return typeof firstMessage === "string" && firstMessage.trim().length > 0
        ? firstMessage
        : fallback
}

export function SignupForm({ className, redirectUrl, ...props }: SignupFormProps) {
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

    const nextUrl = sanitizePostAuthRedirect(redirectUrl)
    const isBusy = form.formState.isSubmitting || isResending || isResetting || !fetchStatus

    async function finalizeAndRedirect(): Promise<boolean> {
        if (signUp.status !== "complete" && !signUp.createdSessionId) {
            form.setError("root", {
                message: `Cannot finalize sign-up yet. Current Clerk status: ${signUp.status}.`,
            })
            return false
        }

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

        setNotice("We sent a verification code to your email address.")
        return true
    }

    const handleSubmit = form.handleSubmit(async (values) => {
        if (!fetchStatus) return

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
                    message: `Verification was accepted, but Clerk has not created a session yet. Current status: ${signUp.status}.`,
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

            if (signUp.unverifiedFields?.includes("email_address")) {
                const sent = await sendVerificationCode()

                if (sent) {
                    setAwaitingVerification(true)
                    form.resetField("verificationCode")
                }

                return
            }

            form.setError("root", {
                message: `Sign-up encountered an unexpected Clerk state: ${signUp.status}.`,
            })
        } catch (error) {
            form.setError("root", {
                message: getErrorMessage(error, "Sign up failed. Please try again."),
            })
        }
    })

    return (
        <form
            className={cn("flex w-full flex-col bg-transparent text-white", className)}
            onSubmit={handleSubmit}
            noValidate
            {...props}
        >
            <UiFieldGroup className="gap-5 border-0 bg-transparent p-0 shadow-none">
                {notice ? (
                    <div className="border border-primary/70 bg-primary/10 px-4 py-3 font-mono text-sm text-blue-100">
                        {notice}
                    </div>
                ) : null}

                {form.formState.errors.root?.message ? (
                    <div className="border border-red-950/70 bg-red-950/30 px-4 py-3 font-mono text-sm text-red-100">
                        {form.formState.errors.root.message}
                    </div>
                ) : null}

                {awaitingVerification ? (
                    <div className="space-y-5">
                        <Field>
                            <FieldLabel className={labelClassName} htmlFor="verificationCode">
                                Verification code
                            </FieldLabel>

                            <Input
                                id="verificationCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="Enter the code you received"
                                className={inputClassName}
                                disabled={isBusy}
                                {...form.register("verificationCode", {
                                    setValueAs: (value: string) =>
                                        typeof value === "string" ? value.replace(/\s+/g, "").trim() : "",
                                })}
                            />

                            <FieldDescription className="font-mono text-sm text-neutral-500">
                                Confirm your email to finish account creation.
                            </FieldDescription>

                            <FieldError
                                errors={
                                    form.formState.errors.verificationCode?.message
                                        ? [{ message: form.formState.errors.verificationCode.message }]
                                        : undefined
                                }
                            />
                        </Field>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <SubmitButton
                                disabled={isBusy}
                                size="cta"
                                className="w-full"
                                pendingLabel={
                                    <>
                                        <LoaderCircle className="size-4 animate-spin" />
                                        Verify code
                                    </>
                                }
                            >
                                Verify code
                            </SubmitButton>

                            <Button
                                type="button"
                                disabled={isBusy}
                                variant="secondary"
                                size="cta"
                                onClick={() => {
                                    startResending(async () => {
                                        form.clearErrors("root")
                                        setNotice(null)
                                        await sendVerificationCode()
                                    })
                                }}
                            >
                                {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                                Resend code
                            </Button>
                        </div>

                        <Button
                            type="button"
                            disabled={isBusy}
                            variant="ghost"
                            size="cta"
                            onClick={() => {
                                startResetting(async () => {
                                    await signUp.reset()
                                    setAwaitingVerification(false)
                                    setNotice(null)
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
                        >
                            {isResetting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                            Start over
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FieldGroup
                                id="firstName"
                                label="First name"
                                error={form.formState.errors.firstName?.message}
                            >
                                <Input
                                    id="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    className={inputClassName}
                                    disabled={isBusy}
                                    {...form.register("firstName", {
                                        setValueAs: (value: string) =>
                                            typeof value === "string" ? value.trim() : "",
                                    })}
                                />
                            </FieldGroup>

                            <FieldGroup
                                id="lastName"
                                label="Last name"
                                error={form.formState.errors.lastName?.message}
                            >
                                <Input
                                    id="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    className={inputClassName}
                                    disabled={isBusy}
                                    {...form.register("lastName", {
                                        setValueAs: (value: string) =>
                                            typeof value === "string" ? value.trim() : "",
                                    })}
                                />
                            </FieldGroup>
                        </div>

                        <FieldGroup
                            id="email"
                            label="Email"
                            error={form.formState.errors.email?.message}
                        >
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="m@example.com"
                                className={inputClassName}
                                disabled={isBusy}
                                {...form.register("email", {
                                    setValueAs: (value: string) =>
                                        typeof value === "string" ? value.trim().toLowerCase() : "",
                                })}
                            />
                        </FieldGroup>

                        <FieldGroup
                            id="password"
                            label="Password"
                            description="Use a strong password you have not used elsewhere."
                            error={form.formState.errors.password?.message}
                        >
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                                className={inputClassName}
                                disabled={isBusy}
                                {...form.register("password")}
                            />
                        </FieldGroup>

                        <Field data-invalid={Boolean(form.formState.errors.acceptedUserAgreement?.message)}>
                            <label className="flex items-start gap-3 border border-neutral-700 bg-black/55 p-4">
                                <Checkbox
                                    className="mt-1 rounded-none"
                                    checked={acceptedUserAgreement}
                                    aria-invalid={Boolean(form.formState.errors.acceptedUserAgreement?.message)}
                                    disabled={isBusy}
                                    onCheckedChange={(checked) => {
                                        form.setValue("acceptedUserAgreement", checked === true, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }}
                                />

                                <span className="text-sm leading-6 font-semibold text-neutral-400">
                                    I agree to the User Agreement,{" "}
                                    <Link href="/legal/terms" className="text-primary underline-offset-4 hover:underline">
                                        Terms of Service
                                    </Link>
                                    , and{" "}
                                    <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
                                        Privacy Policy
                                    </Link>
                                    . I understand Vouch is a neutral payment coordination tool and not a marketplace,
                                    escrow provider, or dispute-resolution service.
                                </span>
                            </label>

                            <FieldError
                                errors={
                                    form.formState.errors.acceptedUserAgreement?.message
                                        ? [{ message: form.formState.errors.acceptedUserAgreement.message }]
                                        : undefined
                                }
                            />
                        </Field>

                        <SubmitButton
                            disabled={isBusy}
                            size="cta"
                            className="w-full"
                            pendingLabel={
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Create account
                                </>
                            }
                        >
                            Create account
                        </SubmitButton>

                        <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-neutral-500">
                            <span>Already have an account?</span>
                            <Link
                                href={
                                    redirectUrl
                                        ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
                                        : "/sign-in"
                                }
                                className="font-mono text-primary underline-offset-4 transition-colors hover:text-white hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>

                        <div id="clerk-captcha" />
                    </div>
                )}
            </UiFieldGroup>
        </form>
    )
}
