import { FAQCard } from "@/components/public/faq-card"

export function FAQTwoColumns({ title, subtitle, description, items }: FAQTwoColumnsProps) {
  const midpoint = Math.ceil(items.length / 2)
  const leftColumn = items.slice(0, midpoint)
  const rightColumn = items.slice(midpoint)

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
    </main>
  )
}
