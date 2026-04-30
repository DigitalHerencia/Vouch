import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> }

const money = (cents: unknown, currency: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency ?? "usd").toUpperCase(),
  }).format(Number(cents ?? 0) / 100)

function card(vouch: unknown) {
  const v = vouch as Record<string, unknown>
  return {
    id: String(v.id),
    href: `/vouches/${v.id}`,
    title: String(v.label ?? v.publicId ?? "Vouch"),
    role: "payer" as const,
    amountLabel: money(v.amountCents, v.currency),
    statusLabel: String(v.status),
    deadlineLabel: String(v.confirmationExpiresAt ?? "No deadline"),
    nextActionLabel: "Open",
  }
}

export default async function DashboardRoute({ searchParams }: PageProps) {
  const params = await searchParams
  const state = await getDashboardPageState(params ? { searchParams: params } : undefined)
  const sections = state.summary?.sections
  return (
    <DashboardPage
      setupComplete={state.variant !== "empty"}
      sections={[
        {
          title: "Action required",
          description: "Vouches that need your attention.",
          vouches: (sections?.actionRequired ?? []).map(card),
        },
        {
          title: "Active",
          description: "Accepted Vouches awaiting confirmation or resolution.",
          vouches: (sections?.active ?? []).map(card),
        },
        {
          title: "Pending",
          description: "Created Vouches awaiting acceptance.",
          vouches: (sections?.pending ?? []).map(card),
        },
        {
          title: "Completed",
          description: "Final Vouches where both parties confirmed.",
          vouches: (sections?.completed ?? []).map(card),
        },
      ]}
    />
  )
}
