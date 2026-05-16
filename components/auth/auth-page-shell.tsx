// components/auth/auth-page-shell.tsx

import type { ReactNode } from "react"

import { AuthCalloutGrid } from "@/components/auth/auth-callout-grid"
import { AuthFooter } from "@/components/auth/auth-footer"
import { AuthHeader } from "@/components/auth/auth-header"
import { cn } from "@/lib/utils"

export interface AuthPageShellProps {
  children: ReactNode
  title: string
  description: string
  eyebrow: string
  footnote: string
  variant?: "signin" | "signup"
  className?: string | undefined
}

export function AuthPageShell({
  children,
  title,
  description,
  eyebrow,
  footnote,
  variant = "signin",
  className,
}: AuthPageShellProps) {
  const isSignup = variant === "signup"

  return (
    <main className={cn("min-h-dvh bg-black text-white", className)}>
      <section className="grid min-h-dvh lg:grid-cols-2">
        <section
          className={cn(
            "flex min-h-dvh flex-col border-neutral-900 bg-black",
            isSignup ? "lg:order-2 lg:border-l" : "lg:order-1 lg:border-r"
          )}
        >
          <AuthHeader />

          <div className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-xl">{children}</div>
          </div>

          <AuthFooter eyebrow={eyebrow}>{footnote}</AuthFooter>
        </section>

        <aside
          className={cn(
            "hidden min-h-dvh bg-black lg:block",
            isSignup ? "lg:order-1" : "lg:order-2"
          )}
        >
          <AuthCalloutGrid title={title} description={description} />
        </aside>
      </section>
    </main>
  )
}
