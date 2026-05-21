"use client"

import {
  FAQAccordion,
  FAQSimpleList,
  FAQTwoColumns,
  FAQWithCategories,
  FAQWithContact,
} from "@/components/blocks/faq-section"

const items = [
  { question: "What releases funds?", answer: "Both parties must confirm presence inside the confirmation window." },
  { question: "Can one side release funds?", answer: "No. One-sided confirmation never releases funds." },
  { question: "Is Vouch escrow?", answer: "No. Vouch coordinates provider-backed payment state." },
  { question: "What happens after expiry?", answer: "The payment resolves to refund, void, or non-capture." },
]

export default function FAQSection() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-5 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <FAQAccordion title="Questions" subtitle="FAQ" description="Common Vouch questions." items={items} />
        <FAQTwoColumns title="Payment Rules" items={items} />
        <FAQWithCategories
          title="Browse by Category"
          categories={[
            { name: "Payments", items: items.slice(0, 2) },
            { name: "Boundaries", items: items.slice(2) },
          ]}
        />
        <FAQWithContact title="Support FAQ" items={items} contactAction={{ label: "Contact Support" }} />
        <FAQSimpleList title="Simple Answers" items={items} />
      </section>
    </main>
  )
}
