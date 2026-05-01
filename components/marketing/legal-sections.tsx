export interface LegalSectionsProps {
  sections: Array<{
    heading: string
    body: string[]
  }>
}

export function LegalSections({ sections }: LegalSectionsProps) {
  return (
    <div className="mt-10 grid border border-neutral-700 bg-[#050706]">
      {sections.map((section) => (
        <section key={section.heading} className="border-b border-neutral-800 p-6 last:border-b-0">
          <h2 className="font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase">
            {section.heading}
          </h2>

          <div className="mt-4 grid gap-3">
            {section.body.map((line) => (
              <p
                key={line}
                className="max-w-215 text-[16px] leading-[1.45] font-semibold text-neutral-400"
              >
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
