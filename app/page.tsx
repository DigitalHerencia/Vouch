import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  ShieldCheck,
  Square,
  UsersRound,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const processSteps = [
  {
    number: "1",
    title: "Create",
    body: "You create a Vouch and set the terms.",
    icon: Square,
  },
  {
    number: "2",
    title: "Accept",
    body: "The other party accepts the Vouch.",
    icon: UsersRound,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both confirm presence within the window.",
    icon: CheckCircle2,
  },
  {
    number: "4",
    title: "Release",
    body: "Funds release. Everyone is covered.",
    icon: LockKeyhole,
  },
]

const stats = [
  {
    label: "Dual Confirmation",
    value: "100%",
    body: "Funds release only when both parties confirm.",
  },
  {
    label: "No-Show Protection",
    value: "24/7",
    body: "If it falls through, you're covered.",
  },
  {
    label: "Clear and Simple",
    value: "4 Steps",
    body: "Create, accept, confirm, release. That's it.",
  },
  {
    label: "Not an Escrow",
    value: "0%",
    body: "Vouch coordinates. Providers process.",
  },
]

const useCases = [
  {
    title: "Appointments",
    body: "Protect medical, wellness, legal, financial, and other important appointments.",
    icon: CalendarDays,
  },
  {
    title: "Meetups",
    body: "Feel confident meeting someone in person for the first time.",
    icon: UsersRound,
  },
  {
    title: "Services",
    body: "Secure payment for one-time services and specialized work.",
    icon: Wrench,
  },
  {
    title: "And More",
    body: "Any in-person agreement where commitment matters.",
    icon: MoreHorizontal,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050807] text-neutral-100 selection:bg-blue-600 selection:text-white">
      <section className="mx-auto min-h-screen w-full max-w-375 border-x border-neutral-800/80 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.045),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(37,99,235,0.13),transparent_28%),linear-gradient(180deg,#050807_0%,#060908_55%,#050706_100%)]">
        <SiteHeader />

        <div className="relative overflow-hidden px-5 pt-8 pb-10 sm:px-8 md:px-10 lg:px-12 lg:pt-14 lg:pb-16">
          <BackgroundMarks />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <HeroCopy />
            <ProcessPanel />
          </div>

          <StatsGrid />

          <UseCasesSection />

          <TrustBand />
        </div>
      </section>
    </main>
  )
}

function SiteHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800/90 px-5 sm:h-18 sm:px-8 md:px-10 lg:px-12">
      <Link
        href="/"
        aria-label="Vouch home"
        className="text-2xl leading-none font-black tracking-[-0.08em] text-white uppercase sm:text-[28px]"
      >
        Vouch
      </Link>

      <nav className="hidden items-center gap-10 text-[11px] font-black tracking-[0.12em] text-neutral-300 uppercase lg:flex">
        <Link href="/how-it-works" className="transition hover:text-white">
          How it works
        </Link>
        <Link href="/pricing" className="transition hover:text-white">
          Pricing
        </Link>
        <Link href="/faq" className="transition hover:text-white">
          FAQ
        </Link>
        <Link href="/about" className="transition hover:text-white">
          About
        </Link>
      </nav>

      <div className="hidden items-center gap-5 lg:flex">
        <Link
          href="/sign-in"
          className="text-[11px] font-black tracking-[0.12em] text-neutral-200 uppercase transition hover:text-white"
        >
          Sign in
        </Link>

        <Button className="h-11 rounded-none border border-blue-500 bg-blue-700 px-7 text-[11px] font-black tracking-[0.08em] text-white uppercase shadow-none hover:bg-blue-600">
          <Link href="/sign-up?return_to=/vouches/new">Get started</Link>
        </Button>
      </div>

      <button
        type="button"
        aria-label="Open navigation"
        className="inline-flex size-10 items-center justify-center border border-transparent text-neutral-100 lg:hidden"
      >
        <Menu className="size-7" strokeWidth={2.5} />
      </button>
    </header>
  )
}

function HeroCopy() {
  return (
    <div className="max-w-172.5 pt-1 sm:pt-5 lg:pt-8">
      <h1 className="max-w-180 text-[43px] leading-[0.89] font-black tracking-[-0.075em] text-white uppercase sm:text-[68px] md:text-[82px] lg:text-[86px] xl:text-[96px]">
        Commitment-
        <br />
        backed payments
        <br />
        for real-world
        <br />
        agreements.
      </h1>

      <p className="mt-6 max-w-117.5 text-base leading-6 font-semibold text-neutral-300 sm:text-lg sm:leading-7">
        A simple way to protect appointments and in-person agreements. Both parties confirm. Then
        funds release. Otherwise, you're covered.
      </p>

      <div className="mt-7 grid gap-3 sm:flex sm:items-center sm:gap-6">
        <Button className="h-14 rounded-none border border-blue-500 bg-blue-700 px-8 text-[12px] font-black tracking-[0.06em] text-white uppercase shadow-none hover:bg-blue-600 sm:min-w-60">
          <Link href="/sign-up?return_to=/vouches/new">
            Create a Vouch
            <ArrowRight className="ml-auto size-6 sm:ml-7" strokeWidth={2} />
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-14 rounded-none border-neutral-600 bg-transparent px-8 text-[12px] font-black tracking-[0.06em] text-neutral-100 uppercase shadow-none hover:bg-neutral-900 hover:text-white sm:min-w-53.75"
        >
          <Link href="/how-it-works">
            How it works
            <ArrowDown className="ml-auto size-4 sm:ml-7" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ProcessPanel() {
  return (
    <aside className="mx-auto w-full max-w-130 border border-neutral-700 bg-[#060908]/80 backdrop-blur-sm lg:mt-5">
      <div className="border-b border-neutral-700 px-6 py-5">
        <p className="text-[12px] font-black tracking-[0.14em] text-neutral-200 uppercase">
          The Vouch Process
        </p>
      </div>

      <div>
        {processSteps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid min-h-23 grid-cols-[1fr_82px] border-b border-neutral-800 sm:grid-cols-[1fr_112px]"
            >
              <div className="flex items-center gap-5 px-5 py-4 sm:px-7">
                <div className="flex size-9 shrink-0 items-center justify-center border border-neutral-500 text-sm font-black text-white">
                  {step.number}
                </div>

                <div>
                  <h2 className="text-sm font-black tracking-[0.08em] text-neutral-100 uppercase sm:text-base">
                    {step.title}
                  </h2>
                  <p className="mt-1 max-w-52.5 text-xs leading-4 font-semibold text-neutral-400 sm:text-sm sm:leading-5">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-8 text-neutral-100" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-700 px-5 py-4 text-center text-[11px] font-black tracking-[0.11em] text-white uppercase">
        No confirmation = refund / void
      </div>
    </aside>
  )
}

function StatsGrid() {
  return (
    <section
      aria-label="Vouch summary metrics"
      className="relative mt-10 grid border border-neutral-700 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="min-h-34 border-b border-neutral-800 p-6 last:border-b-0 sm:odd:border-r lg:border-r lg:border-b-0 lg:last:border-r-0"
        >
          <p className="text-[11px] font-black tracking-[0.12em] text-neutral-300 uppercase">
            {stat.label}
          </p>
          <p className="mt-3 text-[38px] leading-none font-black tracking-[-0.07em] text-white uppercase sm:text-[44px]">
            {stat.value}
          </p>
          <p className="mt-3 max-w-55 text-sm leading-5 font-semibold text-neutral-300">
            {stat.body}
          </p>
        </article>
      ))}
    </section>
  )
}

function UseCasesSection() {
  return (
    <section className="mt-12 lg:mt-16">
      <div className="flex items-center gap-3">
        <span className="size-3 bg-blue-700" />
        <p className="text-[11px] font-black tracking-[0.14em] text-neutral-300 uppercase">
          Built for real life
        </p>
      </div>

      <div className="mt-5 max-w-225">
        <h2 className="text-[36px] leading-[0.95] font-black tracking-[-0.07em] text-white uppercase sm:text-[48px] md:text-[58px]">
          Protect the moments that matter.
        </h2>
        <p className="mt-3 max-w-155 text-base leading-6 font-semibold text-neutral-400">
          Appointments, meetups, services, consultations, and more. Vouch keeps commitments real.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {useCases.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.title}
              className="min-h-47.5 border border-neutral-700 bg-[#070a09]/70 p-6"
            >
              <Icon className="size-9 text-neutral-100" strokeWidth={1.9} />
              <h3 className="mt-6 text-xl font-black tracking-[-0.03em] text-white uppercase">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-5 font-semibold text-neutral-400">{item.body}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function TrustBand() {
  return (
    <section className="mt-8 grid gap-6 border border-neutral-700 bg-[#070a09]/80 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8 lg:grid-cols-[auto_1fr_auto]">
      <div className="flex size-16 items-center justify-center">
        <ShieldCheck className="size-14 text-white" strokeWidth={1.8} />
      </div>

      <div>
        <h2 className="text-xl font-black tracking-[0.03em] text-white uppercase sm:text-2xl">
          Serious by design. Trusted by default.
        </h2>
        <p className="mt-2 max-w-180 text-sm leading-5 font-semibold text-neutral-400 sm:text-base sm:leading-6">
          We're not a marketplace. We don't rate. We don't arbitrate. We protect commitments so you
          can show up with confidence.
        </p>
      </div>

      <Button
        variant="outline"
        className="h-14 rounded-none border-neutral-600 bg-transparent px-8 text-[11px] font-black tracking-[0.08em] text-neutral-100 uppercase shadow-none hover:bg-neutral-900 hover:text-white sm:min-w-67.5"
      >
        <Link href="/legal/terms">
          Learn our principles
          <ArrowRight className="ml-auto size-5" strokeWidth={2} />
        </Link>
      </Button>
    </section>
  )
}

function BackgroundMarks() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute top-[8%] left-[54%] hidden h-px w-7 bg-neutral-800 lg:block" />
      <div className="absolute top-[7%] left-[55.15%] hidden h-7 w-px bg-neutral-800 lg:block" />

      <div className="absolute top-[8%] right-[2%] hidden h-px w-7 bg-neutral-500/70 lg:block" />
      <div className="absolute top-[6.5%] right-[3%] hidden h-7 w-px bg-neutral-500/70 lg:block" />

      <div className="absolute top-[26%] right-[2%] hidden h-px w-7 bg-neutral-500/70 lg:block" />
      <div className="absolute top-[24.5%] right-[3%] hidden h-7 w-px bg-neutral-500/70 lg:block" />

      <div className="absolute top-[43%] right-[2%] hidden h-px w-7 bg-neutral-500/70 lg:block" />
      <div className="absolute top-[41.5%] right-[3%] hidden h-7 w-px bg-neutral-500/70 lg:block" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-size-[120px_120px] opacity-[0.22]" />
    </div>
  )
}
