// components/forms/submit-button.tsx

"use client"

import type { ComponentProps, ReactNode } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export interface SubmitButtonProps extends ComponentProps<typeof Button> {
    pending?: boolean | undefined
    pendingLabel?: ReactNode | undefined
}

export function SubmitButton({
    pending,
    pendingLabel = "Working…",
    children,
    disabled,
    ...props
}: SubmitButtonProps) {
    const status = useFormStatus()
    const isPending = pending ?? status.pending

    return (
        <Button
            type="submit"
            aria-disabled={isPending || disabled}
            disabled={isPending || disabled}
            {...props}
        >
            {isPending ? pendingLabel : children}
        </Button>
    )
}
