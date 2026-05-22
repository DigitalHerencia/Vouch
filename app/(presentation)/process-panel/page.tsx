import Image from "next/image"

import {
  ProcessPanel,
  ProcessPanelGrid,
  ProcessPanelList,
  ProcessPanelRuleGrid,
} from "@/components/blocks/process-panel"
import { landingProcessPanelContent, landingProcessSteps } from "@/content/marketing"
import { Check, FileText, Lock, UsersRound, type LucideIcon } from "lucide-react"

const processIcons: Record<string, LucideIcon> = {
  file: FileText,
  users: UsersRound,
  check: Check,
  lock: Lock,
}

export default function PanelPage() {
  return (
    <main className="p-8 md:p-12">
      <section className="mx-auto grid gap-8 md:gap-16">
        <ProcessPanel
          title={landingProcessPanelContent.title}
          steps={landingProcessSteps.map((step) => ({
            ...step,
            icon: processIcons[step.icon] ?? FileText,
          }))}
          footer={landingProcessPanelContent.footer}
        />

        <ProcessPanelList
          eyebrow="FAQ"
          title="Precise Answers"
          body="Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, broker, or judge."
          items={[
            {
              number: "1",
              title: "What is Vouch?",
              body: "A commitment-backed payment tool for appointments and in-person agreements.",
            },
            {
              number: "2",
              title: "Does one confirmation release funds?",
              body: "No. Both parties must confirm presence inside the defined window.",
            },
            {
              number: "3",
              title: "What happens after the window?",
              body: "The payment resolves by state: release, refund, void, or non-capture.",
            },
          ]}
        />

        <ProcessPanelRuleGrid
          title="Outcome Rules"
          items={[
            { label: "Both confirm", value: "Funds release" },
            { label: "Only one confirms", value: "Refund or void" },
            { label: "Neither confirms", value: "No release" },
            { label: "Window expires", value: "Provider state decides" },
          ]}
          footer="No manual award exists"
        />

        <ProcessPanelGrid
          subtitle="Payment infrastructure"
          title="Provider-backed trust"
          logos={[
            {
              name: "Powered by Stripe",
              logo: (
                <Image
                  src="/Powered by Stripe - white.svg"
                  alt="Powered by Stripe"
                  width={240}
                  height={56}
                  className="h-10 w-auto object-contain"
                />
              ),
            },
            {
              name: "Stripe",
              logo: (
                <Image
                  src="/Stripe wordmark - White.svg"
                  alt="Stripe"
                  width={180}
                  height={72}
                  className="h-12 w-auto object-contain"
                />
              ),
            },
          ]}
        />
      </section>
    </main>
  )
}
