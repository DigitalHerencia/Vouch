type FAQItem = { question: string; answer: string; category?: string }

type FAQAccordionProps = {
  title?: string
  subtitle?: string
  description?: string
  items: readonly FAQItem[]
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQAccordion({ title, subtitle, description, items }: FAQAccordionProps) {
  return (
    <section>
      {(title || subtitle || description) && (
        <div className="mb-12 space-y-8 text-left">
          {subtitle ? (
            <p className="w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              {subtitle}
            </p>
          ) : null}
          {title ? <h1 className="font-black">{title}</h1> : null}
          {description ? (
            <p className="text-base font-medium text-white md:text-lg">{description}</p>
          ) : null}
        </div>
      )}

      <Accordion type="single" collapsible className="space-y-8">
        {items.map((item, index) => (
          <AccordionItem
            key={item.question}
            value={`item-${index}`}
            className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all data-[state=open]:-translate-x-0.5 data-[state=open]:-translate-y-0.5 data-[state=open]:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
          >
            <AccordionTrigger className="px-6 py-8 md:px-8">
              <h3 className="font-bold tracking-wide">{item.question}</h3>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-sm font-medium text-white md:text-base">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
