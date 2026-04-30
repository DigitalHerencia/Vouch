import { VouchListPage } from "@/features/vouches"
import { listUserVouches } from "@/lib/fetchers/vouchFetchers"

const money = (cents: unknown, currency: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency ?? "usd").toUpperCase(),
  }).format(Number(cents ?? 0) / 100)

export default async function Page() {
  const rows = await listUserVouches()
  return (
    <VouchListPage
      items={rows.map((row) => {
        const v = row as Record<string, unknown>
        return {
          id: String(v.id),
          href: `/vouches/${v.id}`,
          title: String(v.label ?? v.publicId ?? "Vouch"),
          statusLabel: String(v.status),
          roleLabel: "participant",
          amountLabel: money(v.amountCents, v.currency),
          deadlineLabel: String(v.confirmationExpiresAt ?? "No deadline"),
          nextActionLabel: "Open",
        }
      })}
    />
  )
}
