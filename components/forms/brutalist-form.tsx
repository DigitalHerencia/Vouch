// components/forms/brutalist-form.tsx

import type { FormHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface BrutalistFormProps extends FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode
}

export function BrutalistForm({
    children,
    className,
    ...props
}: BrutalistFormProps) {
    return (
        <form
            className={cn(
                "grid gap-6 border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px] sm:p-8",
                className,
            )}
            {...props}
        >
            {children}
        </form>
    )
}

export function BrutalistFormHeader({
    title,
    body,
    className,
}: {
    title: ReactNode
    body?: ReactNode | undefined
    className?: string | undefined
}) {
    return (
        <header className={cn("border-b border-neutral-800 pb-6", className)}>
            <h2 className="font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[42px]">
                {title}
            </h2>

            {body ? (
                <p className="mt-3 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                    {body}
                </p>
            ) : null}
        </header>
    )
}

export function BrutalistFormSection({
    children,
    className,
}: {
    children: ReactNode
    className?: string | undefined
}) {
    return <section className={cn("grid gap-5", className)}>{children}</section>
}

export function BrutalistFormFooter({
    children,
    className,
}: {
    children: ReactNode
    className?: string | undefined
}) {
    return (
        <footer
            className={cn(
                "flex flex-col gap-3 border-t border-neutral-800 pt-6 sm:flex-row",
                className,
            )}
        >
            {children}
        </footer>
    )
}
