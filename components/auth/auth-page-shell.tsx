import type { ReactNode } from "react"
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"

import { AuthFooter } from "@/components/auth/auth-footer"
import { AuthHeader } from "@/components/auth/auth-header"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { authCalloutGridContent } from "@/content/auth"
import { cn } from "@/lib/utils"

const icons = { shield: ShieldCheck, check: CheckCircle2, card: CreditCard } as const

export interface AuthPageShellProps { children: ReactNode; title: string; description: string; eyebrow: string; footnote: string; variant?: "signin" | "signup"; className?: string }

export function AuthPageShell({ children, title, description, eyebrow, footnote, variant = "signin", className }: AuthPageShellProps) {
  const isSignup = variant === "signup"
  return (
    <main className={cn("min-h-dvh bg-transparent text-foreground", className)}>
      <section className="grid min-h-dvh lg:grid-cols-2">
        <section className={cn("flex min-h-dvh flex-col bg-transparent", isSignup ? "lg:order-2" : "lg:order-1")}>
          <AuthHeader />
          <div className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-12"><div className="mx-auto w-full max-w-xl">{children}</div></div>
          <AuthFooter eyebrow={eyebrow}>{footnote}</AuthFooter>
        </section>
        <aside className={cn("hidden min-h-dvh bg-transparent px-6 py-10 sm:px-10 lg:block lg:px-12", isSignup ? "lg:order-1" : "lg:order-2")}>
          <div className="mx-auto grid h-full max-w-3xl content-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">{authCalloutGridContent.eyebrow}</p>
            <h1 className="text-6xl font-semibold uppercase leading-none tracking-tight text-white">{title}</h1>
            <p className="max-w-2xl text-lg font-semibold leading-7 text-neutral-300">{description}</p>
            <div className="grid gap-4">
              {authCalloutGridContent.principles.map((item) => { const Icon = icons[item.icon]; return <Card key={item.title} className="rounded-none border-neutral-800 bg-black/80"><CardContent className="grid gap-5 sm:grid-cols-[auto_1fr]"><Icon className="size-8 text-white" /><div><CardTitle className="text-3xl">{item.title}</CardTitle><CardDescription className="mt-2 font-semibold">{item.body}</CardDescription></div></CardContent></Card> })}
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
