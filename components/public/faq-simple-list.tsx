type FAQItem = { question: string; answer: string; category?: string }

type FAQSimpleListProps = { title?: string; subtitle?: string; items: readonly FAQItem[] }

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-vouch-md"
const headingMotion =
  "transition-all duration-300 text-shadow-vouch-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-vouch-md"

export function FAQSimpleList({ title, subtitle, items }: FAQSimpleListProps) {
  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-12 space-y-8 text-left">
          {subtitle ? (
            <p
              className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-vouch-sm ${subtitleMotion}`}
            >
              {subtitle}
            </p>
          ) : null}
          {title ? <h1 className={`font-black ${headingMotion}`}>{title}</h1> : null}
        </div>
      )}

      <div className="border-3 border-neutral-400 bg-black shadow-vouch-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-vouch-xl">
        {items.map((item, index) => (
          <div
            key={item.question}
            className="border-b-3 border-neutral-400 px-6 py-8 last:border-b-0 md:px-12"
          >
            <div className="flex items-center gap-10">
              <div className="flex size-14 shrink-0 items-center justify-center border-3 border-neutral-400 bg-black text-2xl font-black text-white md:size-24 md:text-6xl">
                {index + 1}
              </div>
              <div className="max-w-3xl space-y-2">
                <h3 className="font-bold tracking-wide">{item.question}</h3>
                <p className="text-sm font-medium text-white md:text-base">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
