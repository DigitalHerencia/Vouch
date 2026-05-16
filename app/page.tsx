import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  LockKeyhole,
  MoreHorizontal,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react"
import Link from "next/link"

import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"
import { Button } from "@/components/ui/button"
import {
  landingHeroActionsContent,
  landingHeroContent,
  landingMetrics,
  landingProcessPanelContent,
  landingProcessSteps,
  landingSectionIntroContent,
  landingTrustPanelContent,
  landingUseCases,
} from "@/content/marketing"

const processIcons = [FilePenLine, UsersRound, CheckCircle2, LockKeyhole] as const
const useCaseIcons = [CalendarDays, UsersRound, Wrench, MoreHorizontal] as const

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <section className="grid items-center gap-14 lg:grid-cols-[1fr_35rem]">
          <section className="space-y-7">
            <h1 className="max-w-[10ch] text-[clamp(4.25rem,7.5vw,7.5rem)] font-black uppercase leading-[0.86] text-white">
              {landingHeroContent.title}
            </h1>
            <p className="max-w-2xl text-lg font-semibold leading-7 text-neutral-300">
              {landingHeroContent.body}
            </p>
            <nav className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="primary"
                size="cta"
                className="w-full justify-center sm:w-56"
                render={<Link href="/sign-up?return_to=/vouches/new" />}
              >
                {landingHeroActionsContent.primaryLabel}
                <ArrowRight className="size-5" />
              </Button>
              <Button
                variant="secondary"
                size="cta"
                className="w-full justify-center sm:w-56"
                render={<Link href="#process" />}
              >
                {landingHeroActionsContent.secondaryLabel}
                <ArrowDown className="size-5" />
              </Button>
            </nav>
          </section>

          <section id="process" className="border border-neutral-700 bg-black/80">
            <header className="border-b border-neutral-800 px-6 py-5">
              <h2 className="text-base font-black uppercase leading-none tracking-[0.08em] text-white">
                {landingProcessPanelContent.title}
              </h2>
            </header>
            {landingProcessSteps.map((step, index) => {
              const Icon = processIcons[index] ?? FilePenLine

              return (
                <article
                  key={step.number}
                  className="grid grid-cols-[5rem_1fr_7rem] items-center border-b border-neutral-800"
                >
                  <p className="grid size-11 place-items-center justify-self-center border border-neutral-700 text-base font-black text-white">
                    {step.number}
                  </p>
                  <section className="px-2 py-6">
                    <h3 className="text-[2rem] font-black uppercase leading-none text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-72 text-base font-semibold leading-6 text-neutral-400">
                      {step.body}
                    </p>
                  </section>
                  <Icon className="mx-auto size-8 text-white" strokeWidth={1.8} />
                </article>
              )
            })}
            <footer className="px-6 py-5 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
              {landingProcessPanelContent.footer}
            </footer>
          </section>
        </section>

        <section className="mt-12 grid border border-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
          {landingMetrics.map((metric) => (
            <article
              key={metric.label}
              className="border-b border-neutral-800 p-6 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
            >
              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                {metric.label}
              </p>
              <p className="mt-3 text-5xl font-black uppercase leading-none text-white">
                {metric.value}
              </p>
              <p className="mt-3 text-sm font-semibold leading-5 text-neutral-300">
                {metric.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-16 space-y-8">
          <header className="space-y-5">
            <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-white">
              <span className="size-2 bg-primary" />
              {landingSectionIntroContent.eyebrow}
            </p>
            <h2 className="text-[clamp(2.75rem,5vw,4.4rem)] font-black uppercase leading-[0.9] text-white">
              {landingSectionIntroContent.title}
            </h2>
            <p className="text-lg font-semibold text-neutral-400">
              {landingSectionIntroContent.body}
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {landingUseCases.map((item, index) => {
              const Icon = useCaseIcons[index] ?? MoreHorizontal

              return (
                <article key={item.title} className="border border-neutral-700 p-6">
                  <Icon className="size-8 text-white" strokeWidth={1.8} />
                  <h3 className="mt-8 text-3xl font-black uppercase leading-none text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm font-semibold leading-5 text-neutral-400">
                    {item.body}
                  </p>
                </article>
              )
            })}
          </section>
        </section>

        <section className="mt-10 grid gap-6 border border-neutral-700 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-9">
          <ShieldCheck className="size-12 text-white" strokeWidth={1.8} />
          <article>
            <h2 className="max-w-4xl text-[clamp(2rem,3.2vw,3.25rem)] font-black uppercase leading-[0.95] text-white">
              {landingTrustPanelContent.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-6 text-neutral-400">
              {landingTrustPanelContent.body}
            </p>
          </article>
          <Button
            variant="primary"
            size="cta"
            className="w-full justify-center lg:w-72"
            render={<Link href={landingTrustPanelContent.action} />}
          >
            {landingTrustPanelContent.label}
            <ArrowRight className="size-5" />
          </Button>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
