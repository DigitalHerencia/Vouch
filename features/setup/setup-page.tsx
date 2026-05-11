import { ArrowRight, Banknote, CreditCard, FileText, Shield, UserRound } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export type SetupItem = {
  id: string
  label: string
  description: string
  complete: boolean
  actionLabel?: string
  actionHref?: string
}

type SetupPageProps = {
  title?: string
  subtitle?: string
  items: SetupItem[]
  returnTo?: string
}

const icons = [UserRound, Shield, CreditCard, Banknote, FileText]

export function SetupPage({
  title = "Let's get your account ready.",
  subtitle = "Complete the steps below to create and accept Vouches. It takes about 5 minutes.",
  items,
  returnTo,
}: SetupPageProps) {
  const displayItems = items.filter((item) => item.id !== "account").slice(0, 5)
  const completeCount = displayItems.filter((item) => item.complete).length
  const progress = displayItems.length ? Math.round((completeCount / displayItems.length) * 100) : 0

  return (
    <main className="grid w-full gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-start">
      <section className="lg:pt-14">
        <SectionIntro eyebrow="Onboarding" title={title} body={subtitle} />
        <Surface className="mt-8" padding="md" variant="muted">
          <div className="flex gap-4">
            <span className="grid size-9 place-items-center border border-blue-700 text-blue-500">i</span>
            <div>
              <h2 className="font-bold text-white">Why these steps?</h2>
              <p className="mt-2 text-sm text-neutral-400">Verification and payment setup protect both parties and keep every Vouch outcome predictable.</p>
            </div>
          </div>
        </Surface>
        <Button className="mt-5 h-14 w-full rounded-none bg-blue-700" render={<a href={returnTo ?? "/dashboard"} />}>
          Continue <ArrowRight className="ml-auto size-5" />
        </Button>
      </section>

      <Surface className="p-4 sm:p-6" variant="muted">
        <div className="mb-5 flex items-center justify-between">
          <p className="vouch-label text-neutral-200">{displayItems.length} steps</p>
          <p className="vouch-label text-neutral-200">{progress}% complete</p>
        </div>
        <Progress value={progress} className="mb-6 h-2 rounded-none bg-neutral-800" />
        <div className="grid border border-neutral-800">
          {displayItems.map((item, index) => {
            const Icon = icons[index] ?? FileText
            return (
              <a
                key={item.id}
                href={item.actionHref ?? "#"}
                className="grid grid-cols-[44px_36px_1fr_auto] items-center gap-4 border-b border-neutral-800 p-4 last:border-b-0 hover:bg-neutral-900/70"
              >
                <span className={item.complete ? "grid size-10 place-items-center bg-green-950 text-green-400" : "grid size-10 place-items-center bg-blue-700 text-white"}>
                  {index + 1}
                </span>
                <Icon className="size-6 text-neutral-400" />
                <span>
                  <span className="block font-bold text-white">{item.label}</span>
                  <span className="block text-sm text-neutral-400">{item.description}</span>
                </span>
                <Badge variant="outline" className="rounded-none border-neutral-700 text-neutral-300">
                  {item.complete ? "Complete" : "Pending"}
                </Badge>
              </a>
            )
          })}
        </div>
      </Surface>
    </main>
  )
}
