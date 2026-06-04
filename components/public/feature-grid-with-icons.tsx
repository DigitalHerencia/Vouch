import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const featureColors = ["bg-black"]
const iconColors = ["bg-black", "bg-black", "bg-black", "bg-black", "bg-black"]

export function FeatureGridWithIcons({
  title,
  subtitle,
  description,
  features,
  columns = 3,
}: FeatureGridWithIconsProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
          {(title || subtitle || description) && (
            <div className="mb-12 space-y-4 text-center">
              {subtitle && (
                <p className="text-lg font-bold tracking-widest text-blue-600 uppercase">
                  {subtitle}
                </p>
              )}
              {title && <h2 className="font-black uppercase">{title}</h2>}
              {description && (
                <p className="mx-auto max-w-2xl text-lg font-medium text-neutral-400">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className={`grid gap-8 ${gridCols[columns]}`}>
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`group transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)] ${
                  featureColors[index % 6]
                }`}
              >
                <CardHeader>
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${
                      iconColors[index % 6]
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="uppercase">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
