import type { ReactNode } from "react"
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"

import { AuthFooter } from "@/components/auth/auth-footer"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthForms } from "@/components/blocks/auth-forms"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { authCalloutGridContent } from "@/content/auth"
import { cn } from "@/lib/utils"

const icons = { shield: ShieldCheck, check: CheckCircle2, card: CreditCard } as const

export interface AuthPageShellProps {
  children: ReactNode
  title: string
  description: string
  eyebrow: string
  footnote: string
  variant?: "signin" | "signup"
  className?: string
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
  const brandContent = (
    <div className="mx-auto grid h-full max-w-3xl content-center gap-6">
      <p className="text-xs font-semibold tracking-[0.24em] text-blue-400 uppercase">
        {authCalloutGridContent.eyebrow}
      </p>
      <h1 className="text-6xl leading-none font-semibold tracking-tight text-white uppercase">
        {title}
      </h1>
      <p className="max-w-2xl text-lg leading-7 font-semibold text-neutral-300">{description}</p>
      <div className="grid gap-4">
        {authCalloutGridContent.principles.map((item) => {
          const Icon = icons[item.icon]
          return (
            <Card key={item.title}>
              <CardContent className="grid gap-5 sm:grid-cols-[auto_1fr]">
                <Icon className="size-8 text-white" />
                <div>
                  <CardTitle className="text-3xl">{item.title}</CardTitle>
                  <CardDescription className="mt-2 font-semibold">{item.body}</CardDescription>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  return (
    <main className={cn("text-foreground min-h-dvh bg-transparent", className)}>
      <AuthForms.SplitLayout
        position={isSignup ? "right" : "left"}
        brandBackground="grid-pattern bg-neutral-950 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.32),transparent_26rem)]"
        brandContent={brandContent}
        className="min-h-dvh"
      >
        <section
          className={cn(
            "flex min-h-dvh w-full max-w-2xl flex-col bg-transparent"
          )}
        >
          <AuthHeader />
          <div className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-xl">{children}</div>
          </div>
          <AuthFooter eyebrow={eyebrow}>{footnote}</AuthFooter>
        </section>
      </AuthForms.SplitLayout>
    </main>
  )
}
