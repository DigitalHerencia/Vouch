// components/feedback/loading-state.tsx

import { cn } from "@/lib/utils"

export interface LoadingStateProps {
    title?: string | undefined
    body?: string | undefined
    blocks?: number | undefined
    className?: string | undefined
}

export function LoadingState({
    title = "Loading",
    body = "Preparing the next Vouch surface.",
    blocks = 3,
    className,
}: LoadingStateProps) {
    return (
        <section
            role="status"
            aria-live="polite"
            className={cn(
                "border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px] sm:p-8",
                className,
            )}
        >
            <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-primary uppercase">
                {title}
            </p>

            <div className="mt-5 h-4 overflow-hidden border border-neutral-700 bg-black">
                <div className="h-full w-2/3 animate-pulse bg-primary" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: blocks }).map((_, index) => (
                    <div
                        key={index}
                        className="border border-neutral-800 bg-black/40 p-4"
                    >
                        <div className="h-2 w-10 bg-primary" />
                        <div className="mt-4 h-3 w-24 animate-pulse bg-neutral-800" />
                    </div>
                ))}
            </div>

            <p className="mt-6 max-w-130 text-[14px] leading-[1.4] font-semibold text-neutral-400">
                {body}
            </p>
        </section>
    )
}

export { LoadingState as SkeletonState }
