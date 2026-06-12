import { Handshake } from "lucide-react"

import { FAQSimpleList } from "@/components/public/faq-simple-list"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import {
  legalPageContent,
  userAgreementCalloutContent,
  userAgreementSections,
} from "@/content/legal"

export default function UserAgreementRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQSimpleList
        subtitle={legalPageContent.eyebrow}
        title={legalPageContent.userAgreementTitle}
        items={userAgreementSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={userAgreementCalloutContent.title}
        description={userAgreementCalloutContent.body}
        primaryAction={{
          label: userAgreementCalloutContent.label,
          href: userAgreementCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
