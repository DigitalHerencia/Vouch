import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

const featureColors = ["bg-secondary"]

const iconColors = ["bg-primary", "bg-primary", "bg-primary", "bg-primary", "bg-primary"]

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
  className?: string
}

export function FeatureGridWithIcons({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  className,
}: FeatureGridWithIconsProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-primary uppercase">{subtitle}</p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid gap-6", gridCols[columns])}>
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={cn(
                "group transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]",
                featureColors[index % 6]
              )}
            >
              <CardHeader>
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center border-3 border-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]",
                    iconColors[index % 6]
                  )}
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
  className?: string
}

export function FeatureGridWithImages({
  title,
  subtitle,
  features,
  className,
}: FeatureGridWithImagesProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-secondary uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="mb-4 overflow-hidden border-3 border-foreground shadow-[6px_6px_0px_hsl(var(--shadow-color))] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={640}
                  height={360}
                  className="h-48 w-full object-cover"
                />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">{feature.title}</h3>
              <p className="font-medium text-muted-foreground">{feature.description}</p>
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
  className?: string
}

export function FeatureGridAlternating({ features, className }: FeatureGridAlternatingProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl space-y-16">
        {features.map((feature, index) => {
          const isReversed = index % 2 === 1

          return (
            <div
              key={feature.title}
              className={cn(
                "grid items-center gap-8 md:grid-cols-2 md:gap-12",
                isReversed && "md:[&>*:first-child]:order-2"
              )}
            >
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center border-3 border-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))]",
                    iconColors[index % 6]
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase md:text-3xl">{feature.title}</h3>
                <p className="text-lg font-medium text-muted-foreground">{feature.description}</p>
              </div>

              <div className="relative">
                <div className="overflow-hidden border-3 border-foreground shadow-[8px_8px_0px_hsl(var(--shadow-color))] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_hsl(var(--shadow-color))]">
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
  className?: string
}

export function FeatureBentoGrid({ title, subtitle, features, className }: FeatureBentoGridProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="inline-block border-2 border-foreground bg-accent px-3 py-1 text-sm font-bold tracking-widest text-accent-foreground uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            )}
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
                className={cn(
                  "group flex flex-col overflow-hidden transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]",
                  featureColors[index % 6],
                  spanClass
                )}
              >
                <CardHeader className="flex-1">
                  <div
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center border-3 border-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]",
                      iconColors[index % 6]
                    )}
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
