import Link from "next/link"
import { Button } from "../ui/button"
import { CheckCircle } from "lucide-react"

const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function CTAWithBackground({
  icon,
  title,
  description,
  primaryAction,
  backgroundColor = "primary",
}: CTAWithBackgroundProps) {
  const bgColors: Record<NonNullable<CTAWithBackgroundProps["backgroundColor"]>, string> = {
    primary: "bg-blue-600/10 text-white",
    secondary: "bg-black text-white",
    accent: "bg-blue-600 text-white",
    muted: "bg-black/90 text-white",
  }

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div
          className={`border-3 border-neutral-400 p-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] backdrop-blur-3xl md:p-12 ${cardMotion} ${bgColors[backgroundColor]}`}
        >
          <div className="space-y-6 text-center">
            <div>{icon ?? <CheckCircle className="mx-auto h-12 w-12" />}</div>
            <h1 className="font-black">{title}</h1>
            {description ? (
              <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
            ) : null}
            {primaryAction && (
              <div>
                {primaryAction &&
                  (primaryAction.href ? (
                    <Button size="lg" variant="default" asChild>
                      <Link href={primaryAction.href}>{primaryAction.label}</Link>
                    </Button>
                  ) : (
                    <Button size="lg" variant="default" onClick={primaryAction.onClick}>
                      {primaryAction.label}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
