import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const featureColors = ["bg-black"]
const iconColors = ["bg-black", "bg-black", "bg-black", "bg-black", "bg-black"]
const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingWordMotion =
  "inline-block text-white transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const cardMotion =
  "group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function FeatureBentoGrid({
  title,
  subtitle,
  features,
  align = "center",
}: FeatureBentoGridProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
          {(title || subtitle) && (
            <div className={`mb-12 space-y-8 ${align === "left" ? "text-left" : "text-center"}`}>
              {subtitle && (
                <p
                  className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion}`}
                >
                  {subtitle}
                </p>
              )}

              {title && (
                <h1
                  className={`group flex flex-wrap gap-x-4 font-black uppercase ${
                    align === "left" ? "justify-start" : "justify-center"
                  }`}
                >
                  {title.split(" ").map((word, i) => (
                    <span
                      key={`${word}-${i}`}
                      className={headingWordMotion}
                      style={{ transitionDelay: `${i * 75}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
              )}
            </div>
          )}

          <div className="grid auto-rows-auto gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const spanClass = {
                normal: "",
                wide: "md:col-span-2",
                tall: "md:row-span-2",
              }[feature.span || "normal"]

              return (
                <Card
                  key={feature.title}
                  className={`${cardMotion} ${featureColors[index % 6]} ${spanClass}`}
                >
                  <CardHeader className="flex-1">
                    <div className="mb-4 flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center border-3 border-neutral-400 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${
                          iconColors[index % 6]
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl leading-none uppercase">
                        {feature.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
