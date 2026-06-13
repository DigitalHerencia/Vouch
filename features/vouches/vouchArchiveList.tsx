import { InvoiceSummary } from "@/components/dashboard/invoice-summary"
import type { InvoiceSummaryData } from "@/types/dashboardTypes"

export function VouchArchiveList({ vouches }: { vouches: InvoiceSummaryData[] }) {
  return (
    <section className="grid gap-7 md:gap-8" aria-label="Archived Vouches">
      {vouches.map((vouch) => (
        <InvoiceSummary key={vouch.vouchId ?? vouch.invoiceNumber} {...vouch} />
      ))}
    </section>
  )
}
