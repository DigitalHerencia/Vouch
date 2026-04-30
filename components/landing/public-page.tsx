import Link from "next/link"
import { ArrowRight, CheckCircle2, CreditCard, LockKeyhole, ShieldCheck, XCircle } from "lucide-react"

import { ProcessPanel } from "@/components/landing/process-panel"
import { SiteHeader } from "@/components/navigation/site-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const shellClassName = "mx-auto min-h-screen w-full max-w-7xl border-x border-neutral-900 bg-black/20 text-white"

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={shellClassName}>
      <SiteHeader />
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">{children}</div>
    </main>
  )
}

export function LandingPage() {
  return (
    <PublicShell>
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="pt-4">
          <Badge className="rounded-none bg-blue-700 font-mono uppercase">Payment coordination</Badge>
          <h1 className="mt-5 max-w-4xl text-[52px] leading-[0.88] sm:text-[76px] lg:text-[96px]">
            Back your commitment.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-neutral-300">
            One person creates a Vouch and commits funds. The other accepts. When the meeting
            happens, both parties confirm. If both confirm in time, funds release. If confirmation
            does not complete, the payment is refunded or not captured.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="h-13 rounded-none bg-blue-700 px-7" render={<Link href="/sign-up?return_to=/vouches/new" />}>
              Create a Vouch
              <ArrowRight />
            </Button>
            <Button variant="outline" className="h-13 rounded-none px-7" render={<Link href="/how-it-works" />}>
              How it works
            </Button>
          </div>
        </div>
        <ProcessPanel />
      </section>

      <MetricGrid />
      <UseCaseGrid />
      <TrustPanel />
      <FinalCta />
    </PublicShell>
  )
}

export function HowItWorksPage() {
  return (
    <PublicShell>
      <PageHeader eyebrow="Deterministic flow" title="How Vouch works" body="Vouch is intentionally narrow: create, accept, both confirm, then release. Otherwise refund, void, or non-capture." />
      <ProcessPanel />
      <RulePanel />
      <FinalCta />
    </PublicShell>
  )
}

export function PricingPage() {
  return (
    <PublicShell>
      <PageHeader eyebrow="Pricing" title="Clear before commitment" body="Fees are shown before a Vouch is committed. Vouch coordinates payment outcomes through provider infrastructure and does not claim escrow status." />
      <Card className="mt-8 rounded-none border-2 border-neutral-800 bg-neutral-950/70">
        <CardHeader>
          <CardTitle>Fee summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line item</TableHead>
                <TableHead>When shown</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Vouch amount</TableCell>
                <TableCell>Before commitment</TableCell>
                <TableCell>Conditional amount tied to dual confirmation.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Platform fee</TableCell>
                <TableCell>Before commitment</TableCell>
                <TableCell>Calculated server-side and recorded with the Vouch.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Provider fees</TableCell>
                <TableCell>Provider-controlled</TableCell>
                <TableCell>Handled through Stripe/Connect infrastructure.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaymentSafetyNote />
      <FinalCta />
    </PublicShell>
  )
}

export function FaqPage() {
  const items = [
    ["Is Vouch a marketplace?", "No. Vouch does not provide listings, discovery, public profiles, categories, reviews, ratings, or booking."],
    ["Does Vouch hold funds?", "No. Payment state is provider-backed. Vouch stores references and readiness state, not raw payment details."],
    ["When do funds release?", "Only when both parties confirm presence within the confirmation window and the provider release/capture succeeds."],
    ["What if one person confirms?", "One-sided confirmation never releases funds."],
    ["Does Vouch resolve disputes?", "No. Vouch does not mediate, arbitrate, award funds, or decide who was right."],
    ["What happens after expiration?", "If both confirmations are not complete, Vouch triggers refund, void, or non-capture according to the provider flow."],
  ]

  return (
    <PublicShell>
      <PageHeader eyebrow="FAQ" title="Precise answers" body="Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, or judge." />
      <Accordion className="mt-8 border-2 border-neutral-800 bg-neutral-950/70">
        {items.map(([title, body], index) => (
          <AccordionItem key={title} value={`item-${index}`} className="border-neutral-800 px-5">
            <AccordionTrigger className="font-display text-xl uppercase">{title}</AccordionTrigger>
            <AccordionContent className="text-neutral-400">{body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <FinalCta />
    </PublicShell>
  )
}

export function LegalPage({ title, sections }: { title: string; sections: Array<{ heading: string; body: string[] }> }) {
  return (
    <PublicShell>
      <PageHeader eyebrow="Legal" title={title} body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration." />
      <div className="mt-8 grid gap-4">
        {sections.map((section) => (
          <Card key={section.heading} className="rounded-none border-2 border-neutral-800 bg-neutral-950/70">
            <CardHeader>
              <CardTitle>{section.heading}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-neutral-300">
              {section.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </PublicShell>
  )
}

function PageHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="max-w-4xl">
      <p className="vouch-label text-blue-500">{eyebrow}</p>
      <h1 className="mt-3 text-[48px] leading-[0.9] sm:text-[72px]">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg font-semibold text-neutral-400">{body}</p>
    </header>
  )
}

function MetricGrid() {
  const metrics = [
    ["100%", "Dual confirmation", "Release requires both parties."],
    ["0", "Marketplace surfaces", "No listings, categories, ratings, or reviews."],
    ["4", "Core steps", "Create, accept, confirm, release or refund."],
  ]
  return (
    <section className="mt-12 grid border-2 border-neutral-800 md:grid-cols-3">
      {metrics.map(([value, label, body]) => (
        <div key={label} className="border-b border-neutral-800 p-5 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
          <p className="text-5xl font-black">{value}</p>
          <p className="vouch-label mt-3 text-blue-500">{label}</p>
          <p className="mt-2 text-sm text-neutral-400">{body}</p>
        </div>
      ))}
    </section>
  )
}

function UseCaseGrid() {
  const cases = ["Appointments", "In-person agreements", "Consultations", "No-show protection"]
  return (
    <section className="mt-12">
      <h2 className="text-4xl">Built for commitments you already arranged.</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cases.map((item) => (
          <Card key={item} className="rounded-none border-2 border-neutral-800 bg-neutral-950/70">
            <CardContent className="py-5">
              <CheckCircle2 className="text-blue-500" />
              <h3 className="mt-5 text-2xl">{item}</h3>
              <p className="mt-2 text-sm text-neutral-400">No discovery, no booking, no provider directory.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function TrustPanel() {
  return (
    <section className="mt-8 grid gap-5 border-2 border-neutral-800 bg-black/60 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <ShieldCheck className="text-blue-500" />
      <div>
        <h2 className="text-3xl">Neutral by design.</h2>
        <p className="mt-2 text-neutral-400">Vouch coordinates deterministic payment outcomes. It does not endorse users, judge conduct, or guarantee meeting outcomes.</p>
      </div>
      <Button variant="outline" className="rounded-none" render={<Link href="/faq" />}>
        Read FAQ
      </Button>
    </section>
  )
}

function RulePanel() {
  return (
    <Card className="mt-8 rounded-none border-2 border-blue-900 bg-blue-950/20">
      <CardContent className="grid gap-4 py-5 md:grid-cols-3">
        <div><CheckCircle2 className="text-green-500" /><p className="mt-3 font-bold text-white">Both confirm</p><p className="text-sm text-neutral-400">Funds release through provider flow.</p></div>
        <div><XCircle className="text-amber-500" /><p className="mt-3 font-bold text-white">Confirmation incomplete</p><p className="text-sm text-neutral-400">Refund, void, or non-capture.</p></div>
        <div><LockKeyhole className="text-blue-500" /><p className="mt-3 font-bold text-white">No arbitration</p><p className="text-sm text-neutral-400">Vouch does not decide who was right.</p></div>
      </CardContent>
    </Card>
  )
}

function PaymentSafetyNote() {
  return (
    <Card className="mt-5 rounded-none border-2 border-neutral-800 bg-neutral-950/70">
      <CardContent className="flex gap-4 py-5">
        <CreditCard className="text-blue-500" />
        <p className="text-sm text-neutral-300">Payment details are handled by provider-secure flows. Vouch exposes participant-safe summaries only.</p>
      </CardContent>
    </Card>
  )
}

function FinalCta() {
  return (
    <>
      <Separator className="my-12" />
      <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-4xl">Ready to back a commitment?</h2>
          <p className="mt-2 text-neutral-400">Create a Vouch for an appointment or in-person agreement you already arranged.</p>
        </div>
        <Button className="h-12 rounded-none bg-blue-700 px-6" render={<Link href="/sign-up?return_to=/vouches/new" />}>
          Get started
          <ArrowRight />
        </Button>
      </section>
    </>
  )
}

export const termsSections = [
  { heading: "1. Acceptance of Terms", body: ["By accessing or using Vouch, you agree to be bound by these Terms. If you do not agree, do not use the Service."] },
  { heading: "2. What Vouch Is", body: ["Vouch is a payment coordination platform that enables users to conditionally release funds based on mutual confirmation of an in-person meeting.", "Vouch does not arrange meetings, facilitate services, act as a broker, agent, intermediary, marketplace, escrow provider, or dispute-resolution platform."] },
  { heading: "3. Eligibility", body: ["You must be at least 18 years old, provide accurate identity information, and complete identity verification if required."] },
  { heading: "4. Payments and Conditional Logic", body: ["Payments are processed through third-party providers such as Stripe. Vouch does not take direct custody of funds.", "Funds are released only when both parties confirm presence through system-defined methods. Funds are returned when conditions are not met within the defined time window.", "All outcomes are automated, final within Vouch, and not subject to dispute or reversal through Vouch."] },
  { heading: "5. No Dispute Resolution", body: ["Vouch does not mediate disputes, investigate claims, reverse completed outcomes, award funds, or decide who was right."] },
  { heading: "6. Prohibited Use", body: ["You may not use Vouch for illegal activity, to circumvent financial regulations, to misrepresent identity, or to exploit or defraud other users."] },
  { heading: "7. Limitation of Liability", body: ["To the maximum extent permitted by law, Vouch is not liable for user conduct, missed meetings, financial loss outside platform logic, personal injury, or damages."] },
]

export const privacySections = [
  { heading: "1. Introduction", body: ["Vouch respects your privacy. This Privacy Policy explains what data we collect, how we use it, and your options when using the Service."] },
  { heading: "2. Information We Collect", body: ["You may provide name, email address, phone number, identity verification information, and payment account details through third-party providers.", "We collect transaction amounts, transaction status, timestamps, provider references, readiness flags, and audit-safe metadata."] },
  { heading: "3. Identity and Payment Providers", body: ["Identity verification and payment processing may be handled by third-party providers such as Stripe. Vouch does not store raw card data, raw bank data, or raw identity documents."] },
  { heading: "4. How We Use Information", body: ["We use data to operate the platform, verify identity, process payments, enable confirmation flows, prevent fraud and abuse, and comply with legal obligations."] },
  { heading: "5. Sharing", body: ["We share data only when necessary with payment providers, identity providers, legal authorities when required, and fraud or abuse prevention services. We do not sell personal data."] },
  { heading: "6. Retention and Security", body: ["We keep data as long as your account is active or as required for legal, tax, and compliance purposes. We use reasonable safeguards, but no system is completely secure."] },
  { heading: "7. Your Rights", body: ["Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data."] },
]
