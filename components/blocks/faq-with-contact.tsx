import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle } from "lucide-react"

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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
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
    </main>
  )
}
