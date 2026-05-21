"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
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
  className?: string
}

export function FAQAccordion({
  title,
  subtitle,
  description,
  items,
  className,
}: FAQAccordionProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-3xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-primary uppercase">{subtitle}</p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            )}
            {description && (
              <p className="text-lg font-medium text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="space-y-4">
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-3 border-foreground bg-card shadow-[4px_4px_0px_hsl(var(--shadow-color))] transition-all data-[state=open]:-translate-x-0.5 data-[state=open]:-translate-y-0.5 data-[state=open]:shadow-[6px_6px_0px_hsl(var(--shadow-color))]"
            >
              <AccordionTrigger className="px-6 py-4 font-bold tracking-wide uppercase hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                {item.answer}
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
  items: FAQItem[]
  className?: string
}

export function FAQTwoColumns({ title, items, className }: FAQTwoColumnsProps) {
  const midpoint = Math.ceil(items.length / 2)
  const leftColumn = items.slice(0, midpoint)
  const rightColumn = items.slice(midpoint)

  return (
    <section className={cn("bg-muted/30 px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>
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
  categories: FAQCategory[]
  className?: string
}

export function FAQWithCategories({ title, categories, className }: FAQWithCategoriesProps) {
  const [activeCategory, setActiveCategory] = React.useState(0)

  if (!categories.length) return null
  const activeItems = categories[activeCategory]?.items ?? []

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-4xl">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>
        )}

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category, index) => (
            <Button
              key={category.name}
              variant={activeCategory === index ? "default" : "outline"}
              onClick={() => setActiveCategory(index)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-4" key={activeCategory}>
          {activeItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-3 border-foreground bg-card shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
            >
              <AccordionTrigger className="px-6 py-4 font-bold tracking-wide uppercase hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                {item.answer}
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
  items: FAQItem[]
  contactTitle?: string
  contactDescription?: string
  contactAction?: { label: string; onClick?: () => void }
  className?: string
}

export function FAQWithContact({
  title,
  items,
  contactTitle = "Still have questions?",
  contactDescription = "Can't find the answer you're looking for? Please reach out to our friendly team.",
  contactAction,
  className,
}: FAQWithContactProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-4xl">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>
        )}

        <Accordion type="single" collapsible className="mb-12 space-y-4">
          {items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-3 border-foreground bg-card shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
            >
              <AccordionTrigger className="px-6 py-4 font-bold tracking-wide uppercase hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="space-y-4 border-3 border-foreground bg-primary/10 p-8 text-center shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h3 className="text-xl font-black uppercase">{contactTitle}</h3>
          <p className="mx-auto max-w-md font-medium text-muted-foreground">{contactDescription}</p>
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
  items: FAQItem[]
  className?: string
}

export function FAQSimpleList({ title, items, className }: FAQSimpleListProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-3xl">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>
        )}

        <div className="space-y-8">
          {items.map((item) => (
            <div key={item.question} className="space-y-2">
              <h3 className="text-lg font-bold">{item.question}</h3>
              <p className="text-muted-foreground">{item.answer}</p>
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
    <div className="border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_hsl(var(--shadow-color))]">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-sm font-black text-primary-foreground">
          {index + 1}
        </div>
        <div>
          <h3 className="mb-2 font-bold">{item.question}</h3>
          <p className="text-sm text-muted-foreground">{item.answer}</p>
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
