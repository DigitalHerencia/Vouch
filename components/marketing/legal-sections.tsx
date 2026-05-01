// components/marketing/legal-sections.tsx

export interface LegalSectionsProps {
  sections: Array<{
    heading: string
    body: string[]
  }>
}

export function LegalSections({ sections }: LegalSectionsProps) {
  return (
    <section className="mt-14 grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]">
      {sections.map((section) => (
        <section
          key={section.heading}
          className="border-b border-neutral-800 p-6 last:border-b-0 sm:p-7"
        >
          <h2 className="font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[42px]">
            {section.heading}
          </h2>

          <div className="mt-5 grid gap-4">
            {section.body.map((line) => (
              <p
                key={line}
                className="max-w-230 text-base leading-[1.45] font-semibold text-neutral-400 sm:text-lg"
              >
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}
