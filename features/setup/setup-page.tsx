import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type SetupItem = {
  id: string
  label: string
  description: string
  complete: boolean
  actionLabel?: string
  actionHref?: string
}

type SetupPageProps = {
  title?: string
  subtitle?: string
  items: SetupItem[]
  returnTo?: string
}

export function SetupPage({
  title = "Finish setup to continue",
  subtitle = "Complete the required items before using payment-backed Vouch flows.",
  items,
  returnTo,
}: SetupPageProps) {
  const isComplete = items.every((item) => item.complete)

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isComplete ? "Setup complete" : "Required setup"}</CardTitle>
          <CardDescription>
            This protects both parties and keeps payment outcomes predictable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-background flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">
                  {item.complete ? "Complete" : "Required"}
                </span>
                {!item.complete && item.actionLabel && item.actionHref ? (
                  <Button size="sm" render={<a href={item.actionHref} />}>
                    {item.actionLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {isComplete ? (
        <div>
          <Button render={<a href={returnTo ?? "/dashboard"} />}>Continue</Button>
        </div>
      ) : null}
    </main>
  )
}
