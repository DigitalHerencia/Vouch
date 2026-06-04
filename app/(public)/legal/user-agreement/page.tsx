import { CTAWithBackground } from "@/components/shared/cta-section"
import { FAQSimpleList } from "@/components/public/faq-section"
import { userAgreementSections } from "@/content/legal"
import { landingCalloutContent } from "@/content/marketing"
import { Handshake } from "lucide-react"

export default function UserAgreementRoute() {
  return (
    <main>
      <FAQSimpleList
        subtitle="legal"
        title="User Agreement"
        items={userAgreementSections.map((section) => ({
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
