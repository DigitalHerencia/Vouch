import { HeroCentered } from "@/components/shared/hero-centered"
import { EmptyStatePreset } from "@/components/ui/empty-state"
import { VouchArchiveList } from "@/features/vouches/vouchArchiveList"
import { mapVouchCardDTO } from "@/lib/db/dto/vouch.mappers"
import { mapVouchToInvoice } from "@/lib/db/dto/dashboard.mappers"
import { getArchivePageState } from "@/lib/fetchers/dashboardFetchers"

export async function VouchArchiveFeature() {
  const state = await getArchivePageState()
  const vouches = state.vouches.map(mapVouchCardDTO).map(mapVouchToInvoice)

  return (
    <div className="grid gap-(--vouch-section-gap)">
      <HeroCentered
        eyebrow="Participant ledger"
        title="Vouch Archive"
        description={`${state.count} archived Vouch${state.count === 1 ? "" : "es"}. Archived Vouches remain available for review.`}
        align="left"
      />
      {vouches.length > 0 ? (
        <VouchArchiveList vouches={vouches} />
      ) : (
        <EmptyStatePreset
          preset="no-data"
          variant="card"
          size="lg"
          customTitle="No archived Vouches"
          customDescription="Vouches you archive will remain available here."
        />
      )}
    </div>
  )
}
