import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
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
    </main>
  )
}
