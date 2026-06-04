export function FeatureGridWithImages({ title, subtitle, features }: FeatureGridWithImagesProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
          {(title || subtitle) && (
            <div className="mb-12 space-y-4 text-center">
              {subtitle && (
                <p className="text-lg font-bold tracking-widest text-blue-600 uppercase">
                  {subtitle}
                </p>
              )}
              {title && <h2 className="font-black uppercase">{title}</h2>}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="mb-8 overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]">
                  <span
                    aria-label={feature.title}
                    role="img"
                    className="block h-48 w-full bg-cover bg-center object-cover"
                    style={{ backgroundImage: `url(${feature.image})` }}
                  />
                </div>
                <h3 className="mb-2 font-black uppercase">{feature.title}</h3>
                <p className="leading-tight font-medium text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
