import { Check, FileText, Lock, UsersRound, type LucideIcon } from "lucide-react"

import {
  ProcessPanel,
  ProcessPanelGrid,
  ProcessPanelList,
  ProcessPanelRuleGrid,
} from "@/components/blocks/process-panel"
import { presentationContent } from "@/components/(presentation)/presentationContent"

const processIcons: Record<string, LucideIcon> = {
  file: FileText,
  users: UsersRound,
  check: Check,
  lock: Lock,
}

export function ProcessPanelFeature() {
  return (
    <main className="p-8 md:p-12">
      <section className="mx-auto grid gap-8 md:gap-16">
        <ProcessPanel
          title={presentationContent.processPanel.title}
          steps={presentationContent.processPanel.steps.map((step) => ({
            ...step,
            icon: processIcons[step.icon] ?? FileText,
          }))}
          footer={presentationContent.processPanel.footer}
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
                <span
                  aria-label="Powered by Stripe"
                  role="img"
                  className="block h-10 w-36 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: "url(/Powered by Stripe - white.svg)" }}
                />
              ),
            },
            {
              name: "Stripe",
              logo: (
                <span
                  aria-label="Stripe"
                  role="img"
                  className="block h-10 w-36 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: "url(/Stripe wordmark - White.svg)" }}
                />
              ),
            },
          ]}
        />
      </section>
    </main>
  )
}
