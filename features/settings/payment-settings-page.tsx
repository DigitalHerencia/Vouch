import { Button } from "@/components/ui/button"

type PaymentSettingsPageProps = {
  state?: { variant?: string; readiness?: { readiness?: string | null } | null }
  startAction?: (formData: FormData) => void | Promise<void>
  refreshAction?: (formData: FormData) => void | Promise<void>
}

export function PaymentSettingsPage({
  state,
  startAction,
  refreshAction,
}: PaymentSettingsPageProps) {
  const readiness = state?.readiness?.readiness ?? "not_started"
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Payment method</h1>
      <p className="text-muted-foreground">Status: {readiness}</p>
      <div className="flex gap-3">
        {startAction ? (
          <form action={startAction}>
            <Button type="submit">Set up payment</Button>
          </form>
        ) : null}
        {refreshAction ? (
          <form action={refreshAction}>
            <Button type="submit" variant="outline">
              Refresh
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}

export default PaymentSettingsPage
