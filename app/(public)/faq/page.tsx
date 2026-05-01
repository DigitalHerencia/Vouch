import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { FaqItem } from "@/components/marketing/faq-item"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

const faqItems = [
  {
    question: "What is Vouch?",
    answer:
      "Vouch is a commitment-backed payment tool for appointments and in-person agreements. Funds release only when both parties confirm presence during the defined window.",
  },
  {
    question: "Is Vouch a marketplace?",
    answer:
      "No. Vouch does not help users find each other, list services, message, review, rank, or book providers.",
  },
  {
    question: "Does Vouch hold money?",
    answer:
      "No. Vouch uses payment-provider infrastructure to coordinate payment outcomes. Vouch does not directly custody funds.",
  },
  {
    question: "What happens if only one person confirms?",
    answer: "Funds do not release. Both parties must confirm within the window.",
  },
  {
    question: "What happens if nobody confirms?",
    answer: "The Vouch expires and the payment is refunded, voided, or not captured.",
  },
  {
    question: "Does Vouch decide disputes?",
    answer:
      "No. Vouch outcomes are deterministic. The system does not judge who was right or wrong.",
  },
  {
    question: "Does Vouch guarantee someone will show up?",
    answer:
      "No. Vouch does not guarantee behavior. It creates a financial commitment and deterministic payment outcome.",
  },
]

export default function FaqRoute() {
  return (
    <div className="px-6 py-10 sm:px-9 lg:px-10 lg:py-12">
      <BrutalistPageHeader
        eyebrow="FAQ"
        title="Precise answers"
        body="Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, broker, or judge."
      />

      <div className="mt-10 grid border border-neutral-700 bg-[#050706]">
        {faqItems.map((item, index) => (
          <FaqItem key={item.question} index={index + 1} {...item} />
        ))}
      </div>

      <PublicCtaPanel />
    </div>
  )
}
