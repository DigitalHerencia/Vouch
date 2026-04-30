import { Button } from "@/components/ui/button"

type VerificationSettingsPageProps = {
  status?: { identityStatus?: string; adultStatus?: string } | null
  startIdentityAction?: (formData: FormData) => void | Promise<void>
  reconcileAction?: (formData: FormData) => void | Promise<void>
}

export function VerificationSettingsPage({
  status,
  startIdentityAction,
  reconcileAction,
}: VerificationSettingsPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Verification</h1>
      <p className="text-muted-foreground">
        Identity: {status?.identityStatus ?? "unstarted"} · Adult:{" "}
        {status?.adultStatus ?? "unstarted"}
      </p>
      <div className="flex gap-3">
        {startIdentityAction ? (
          <form action={startIdentityAction}>
            <Button type="submit">Start verification</Button>
          </form>
        ) : null}
        {reconcileAction ? (
          <form action={reconcileAction}>
            <Button type="submit" variant="outline">
              Refresh
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}

export default VerificationSettingsPage
