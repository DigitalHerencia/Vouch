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
  "transition-all duration-300 text-shadow-vouch-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-vouch-md"
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
              <div className="space-y-3">
                <div className="space-y-3">
                  <h2
                    className={`max-w-xl text-3xl leading-[1.05] font-black uppercase md:text-5xl ${headingMotion}`}
                  >
                    {feature.title}
                  </h2>
                  <p
                    className={`max-w-xl text-base leading-7 font-medium text-neutral-300 md:text-lg ${bodyTextMotion}`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden border-3 border-neutral-400 shadow-vouch-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-vouch-xl">
                  <div
                    aria-label={feature.title}
                    className={`flex min-h-64 items-center justify-center bg-black text-white md:min-h-72 [&_svg]:size-24 md:[&_svg]:size-32 ${
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
