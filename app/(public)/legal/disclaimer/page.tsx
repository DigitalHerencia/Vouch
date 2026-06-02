import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { disclaimerSections } from "@/content/legal"
import { Handshake } from "lucide-react"
import { landingCalloutContent } from "@/content/marketing"

export default function DisclaimerRoute() {
  return (
    <main>
      <FAQSimpleList
        subtitle="legal"
        title="Disclaimer"
        items={disclaimerSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={landingCalloutContent.title}
        description={landingCalloutContent.body}
        primaryAction={{
          label: landingCalloutContent.label,
          href: landingCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </main>
  )
}
