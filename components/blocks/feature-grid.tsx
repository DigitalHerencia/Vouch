import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

const featureColors = ["bg-black"]

const iconColors = ["bg-blue-600", "bg-blue-600", "bg-blue-600", "bg-blue-600", "bg-blue-600"]

// ============================================================================
// FEATURE GRID VARIANT 1: With Icons
// ============================================================================
export interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

export interface FeatureGridWithIconsProps {
  title?: string
  subtitle?: string
  description?: string
  features: FeatureItem[]
  columns?: 2 | 3 | 4
}

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
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                {subtitle}
              </p>
            )}
            {title && <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>}
            {description && (
              <p className="mx-auto max-w-2xl text-lg font-medium text-neutral-400">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`group transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] ${
                featureColors[index % 6]
              }`}
            >
              <CardHeader>
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)] ${
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
  )
}

// ============================================================================
// FEATURE GRID VARIANT 2: With Images
// ============================================================================
export interface FeatureWithImageItem {
  image: string
  title: string
  description: string
}

export interface FeatureGridWithImagesProps {
  title?: string
  subtitle?: string
  features: FeatureWithImageItem[]
}

export function FeatureGridWithImages({ title, subtitle, features }: FeatureGridWithImagesProps) {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
                {subtitle}
              </p>
            )}
            {title && <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="mb-4 overflow-hidden border-3 border-neutral-400 shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={640}
                  height={360}
                  className="h-48 w-full object-cover"
                />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">{feature.title}</h3>
              <p className="font-medium text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURE GRID VARIANT 3: Alternating
// ============================================================================
export interface FeatureAlternatingItem {
  icon: React.ReactNode
  title: string
  description: string
  image: string
}

export interface FeatureGridAlternatingProps {
  features: FeatureAlternatingItem[]
}

export function FeatureGridAlternating({ features }: FeatureGridAlternatingProps) {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-16">
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
                <div
                  className={`flex h-16 w-16 items-center justify-center border-3 border-neutral-400 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${
                    iconColors[index % 6]
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase md:text-3xl">{feature.title}</h3>
                <p className="text-lg font-medium text-neutral-400">{feature.description}</p>
              </div>

              <div className="relative">
                <div className="overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={960}
                    height={720}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================================
// FEATURE GRID VARIANT 4: Bento Grid
// ============================================================================
export interface BentoFeatureItem {
  icon: React.ReactNode
  title: string
  description: string
  span?: "normal" | "wide" | "tall"
}

export interface FeatureBentoGridProps {
  title?: string
  subtitle?: string
  features: BentoFeatureItem[]
}

export function FeatureBentoGrid({ title, subtitle, features }: FeatureBentoGridProps) {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="inline-block border-2 border-neutral-400 bg-blue-600 px-3 py-1 text-sm font-bold tracking-widest text-white uppercase">
                {subtitle}
              </p>
            )}
            {title && <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>}
          </div>
        )}

        <div className="grid auto-rows-[200px] gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const spanClass = {
              normal: "",
              wide: "md:col-span-2",
              tall: "md:row-span-2",
            }[feature.span || "normal"]

            return (
              <Card
                key={feature.title}
                className={`group flex flex-col overflow-hidden transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] ${
                  featureColors[index % 6]
                } ${spanClass}`}
              >
                <CardHeader className="flex-1">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center border-3 border-neutral-400 shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)] ${
                      iconColors[index % 6]
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg uppercase">{feature.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const FeatureGrid = {
  WithIcons: FeatureGridWithIcons,
  WithImages: FeatureGridWithImages,
  Alternating: FeatureGridAlternating,
  Bento: FeatureBentoGrid,
}
