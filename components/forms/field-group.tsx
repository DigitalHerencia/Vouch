// components/forms/field-group.tsx

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface FieldGroupProps {
    id?: string | undefined
    label: ReactNode
    children: ReactNode
    description?: ReactNode | undefined
    error?: ReactNode | undefined
    required?: boolean | undefined
    className?: string | undefined
}

export function FieldGroup({
    id,
    label,
    children,
    description,
    error,
    required = false,
    className,
}: FieldGroupProps) {
    const descriptionId = id ? `${id}-description` : undefined
    const errorId = id ? `${id}-error` : undefined

    return (
        <div className={cn("grid gap-2", className)}>
            <label
                htmlFor={id}
                className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase"
            >
                {label}
                {required ? <span className="ml-1 text-primary">*</span> : null}
            </label>

            {description ? (
                <p
                    id={descriptionId}
                    className="max-w-160 text-[13px] leading-[1.35] font-semibold text-neutral-500"
                >
                    {description}
                </p>
            ) : null}

            {children}

            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="text-[13px] leading-[1.35] font-semibold text-red-300"
                >
                    {error}
                </p>
            ) : null}
        </div>
    )
}
