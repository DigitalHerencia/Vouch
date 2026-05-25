"use client"

import * as React from "react"
import {
  FAQAccordion,
  FAQSimpleList,
  FAQTwoColumns,
  FAQWithCategories,
  FAQWithContact,
  type FAQItem,
} from "@/components/blocks/faq-section"

const items: FAQItem[] = [
  {
    question: "What releases funds?",
    answer: "Both parties must confirm presence inside the confirmation window.",
  },
  {
    question: "Can one side release funds?",
    answer: "No. One-sided confirmation never releases funds.",
  },
  { question: "Is Vouch escrow?", answer: "No. Vouch coordinates provider-backed payment state." },
  {
    question: "What happens after expiry?",
    answer: "The payment resolves to refund, void, or non-capture.",
  },
]

export function FaqSectionFeatureClient() {
  const [activeCategory, setActiveCategory] = React.useState(0)

  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <FAQAccordion
          title="Questions"
          subtitle="FAQ"
          description="Common Vouch questions."
          items={items}
        />
        <FAQTwoColumns title="Payment Rules" items={items} />
        <FAQWithCategories
          title="Browse by Category"
          categories={[
            { name: "Payments", items: items.slice(0, 2) },
            { name: "Boundaries", items: items.slice(2) },
          ]}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <FAQWithContact
          title="Support FAQ"
          items={items}
          contactAction={{ label: "Contact Support" }}
        />
        <FAQSimpleList title="Simple Answers" items={items} />
      </section>
    </main>
  )
}
