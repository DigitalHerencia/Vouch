import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface FAQItem {
  question: string
  answer: string
}

// ============================================================================
// FAQ VARIANT 1: Simple Accordion
// ============================================================================
export interface FAQAccordionProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

export function FAQAccordion({ title, subtitle, description, items }: FAQAccordionProps) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && <p className="text-sm font-bold text-blue-600 uppercase">{subtitle}</p>}
            {title && <h2 className="font-black">{title}</h2>}
            {description && (
              <p className="text-base font-medium text-white md:text-lg">{description}</p>
            )}
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
      </div>
    </section>
  )
}

// ============================================================================
// FAQ VARIANT 2: Two Columns
// ============================================================================
export interface FAQTwoColumnsProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

export function FAQTwoColumns({ title, subtitle, description, items }: FAQTwoColumnsProps) {
  const midpoint = Math.ceil(items.length / 2)
  const leftColumn = items.slice(0, midpoint)
  const rightColumn = items.slice(midpoint)

  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && <p className="text-sm font-bold text-blue-600 uppercase">{subtitle}</p>}
            {title && <h2 className="font-black">{title}</h2>}
            {description && (
              <p className="text-base font-medium text-white md:text-lg">{description}</p>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {leftColumn.map((item, index) => (
              <FAQCard key={item.question} item={item} index={index} />
            ))}
          </div>
          <div className="space-y-6">
            {rightColumn.map((item, index) => (
              <FAQCard key={item.question} item={item} index={midpoint + index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FAQ VARIANT 3: With Categories
// ============================================================================
export interface FAQCategory {
  name: string
  items: FAQItem[]
}

export interface FAQWithCategoriesProps {
  title?: string
  subtitle?: string
  description?: string
  categories: FAQCategory[]
  activeCategory?: number
  onCategoryChange?: (categoryIndex: number) => void
}

export function FAQWithCategories({
  title,
  subtitle,
  description,
  categories,
  activeCategory = 0,
  onCategoryChange,
}: FAQWithCategoriesProps) {
  if (!categories.length) return null
  const activeItems = categories[activeCategory]?.items ?? []

  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && <p className="text-sm font-bold text-blue-600 uppercase">{subtitle}</p>}
            {title && <h2 className="font-black">{title}</h2>}
            {description && (
              <p className="text-base font-medium text-white md:text-lg">{description}</p>
            )}
          </div>
        )}

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category, index) => (
            <Button
              key={category.name}
              variant={activeCategory === index ? "outline" : "outline"}
              onClick={() => onCategoryChange?.(index)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-8" key={activeCategory}>
          {activeItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
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
      </div>
    </section>
  )
}

// ============================================================================
// FAQ VARIANT 4: With Contact CTA
// ============================================================================
export interface FAQWithContactProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
  contactTitle?: string
  contactDescription?: string
  contactAction?: { label: string; onClick?: () => void }
}

export function FAQWithContact({
  title,
  subtitle,
  description,
  items,
  contactTitle = "Still have questions?",
  contactDescription = "Can't find the answer you're looking for? Please reach out to our friendly team.",
  contactAction,
}: FAQWithContactProps) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && <p className="text-sm font-bold text-blue-600 uppercase">{subtitle}</p>}
            {title && <h2 className="font-black">{title}</h2>}
            {description && (
              <p className="text-base font-medium text-white md:text-lg">{description}</p>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="mb-12 space-y-8">
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
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

        <div className="space-y-4 border-3 border-neutral-400 bg-black p-12 text-center shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
          <HelpCircle className="mx-auto h-16 w-16 text-blue-600" />
          <h2 className="font-black">{contactTitle}</h2>
          <p className="text-base font-medium text-white md:text-lg">{contactDescription}</p>
          {contactAction && (
            <Button size="lg" onClick={contactAction.onClick}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {contactAction.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FAQ VARIANT 5: Simple List
// ============================================================================
export interface FAQSimpleListProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

export function FAQSimpleList({ title, subtitle, description, items }: FAQSimpleListProps) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && <p className="text-sm font-bold text-blue-600 uppercase">{subtitle}</p>}
            {title && <h2 className="font-black">{title}</h2>}
            {description && (
              <p className="text-base font-medium text-white md:text-lg">{description}</p>
            )}
          </div>
        )}

        <div className="space-y-8">
          {items.map((item) => (
            <div
              key={item.question}
              className="border-3 border-neutral-400 bg-black px-6 py-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:px-8"
            >
              <h3 className="font-bold tracking-wide">{item.question}</h3>
              <p className="mt-4 text-sm font-medium text-white md:text-base">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Helper Components
// ============================================================================
function FAQCard({ item, index }: { item: FAQItem; index: number }) {
  return (
    <div className="border-3 border-neutral-400 bg-black px-6 py-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:px-8">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-sm font-black text-white">
          {index + 1}
        </div>
        <div>
          <h4 className="font-bold tracking-wide">{item.question}</h4>
          <p className="mt-4 text-sm font-medium text-white md:text-base">{item.answer}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const FAQSection = {
  Accordion: FAQAccordion,
  TwoColumns: FAQTwoColumns,
  WithCategories: FAQWithCategories,
  WithContact: FAQWithContact,
  SimpleList: FAQSimpleList,
}
