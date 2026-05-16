import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ContentSectionListItem { heading: string; body: readonly string[] }

export function ContentSectionList({ sections, className }: { sections: readonly ContentSectionListItem[]; className?: string }) {
  return (
    <Card className={cn("rounded-none border-neutral-700 bg-black/80", className)}>
      {sections.map((section) => (
        <section key={section.heading} className="border-b border-neutral-800 px-6 py-7 last:border-b-0 sm:px-7 lg:px-8">
          <h2 className="text-4xl font-semibold uppercase leading-none tracking-tight text-white">{section.heading}</h2>
          <div className="mt-5 space-y-4">
            {section.body.map((line) => <p key={line} className="max-w-5xl text-base font-semibold leading-7 text-neutral-400">{line}</p>)}
          </div>
        </section>
      ))}
    </Card>
  )
}
