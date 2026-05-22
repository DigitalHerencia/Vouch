import { Card } from "@/components/ui/card"

export interface ContentSectionListItem {
  heading: string
  body: readonly string[]
}

export function ContentSectionList({ sections }: { sections: readonly ContentSectionListItem[] }) {
  return (
    <Card className="overflow-hidden">
      {sections.map((section) => (
        <section
          key={section.heading}
          className="border-b-2 border-neutral-400 px-6 py-7 last:border-b-0 sm:px-7 lg:px-8"
        >
          <h2 className="font-(family-name:--font-display) text-[clamp(2.5rem,4vw,4rem)] leading-[0.92] tracking-[0.02em] text-white uppercase">
            {section.heading}
          </h2>
          <div className="mt-5 space-y-4">
            {section.body.map((line) => (
              <p key={line} className="max-w-5xl text-base leading-7 font-bold text-neutral-400">
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}
    </Card>
  )
}
