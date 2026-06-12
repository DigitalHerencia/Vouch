type FeatureGridItem = {
  title: string
  description?: string
  icon?: React.ReactNode
  image?: string
  size?: "normal" | "wide" | "tall"
  span?: string
}

type FeatureGridAlternatingProps = { features: readonly FeatureGridItem[] }

const iconColors = ["bg-black", "bg-black", "bg-black", "bg-black", "bg-black"]
const headingMotion =
  "transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"

export function FeatureGridAlternating({ features }: FeatureGridAlternatingProps) {
  return (
    <section>
      <div className="space-y-16">
        {features.map((feature, index) => {
          const isReversed = index % 2 === 1

          return (
            <div
              key={feature.title}
              className={
                isReversed
                  ? "grid items-center gap-8 md:grid-cols-2 md:gap-12 md:[&>*:first-child]:order-2"
                  : "grid items-center gap-8 md:grid-cols-2 md:gap-12"
              }
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className={`font-black uppercase ${headingMotion}`}>{feature.title}</h2>
                  <p className={`text-lg font-medium text-neutral-400 ${bodyTextMotion}`}>
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]">
                  <div
                    aria-label={feature.title}
                    className={`flex min-h-80 items-center justify-center bg-black text-white [&_svg]:size-32 md:[&_svg]:size-40 ${
                      iconColors[index % 6]
                    }`}
                  >
                    {feature.icon}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
