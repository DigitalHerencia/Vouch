import { InvoiceSummary } from "@/components/dashboard/invoice-summary"
import type { InvoiceSummaryData } from "@/types/dashboardTypes"
import { dashboardContent } from "@/content/dashboard"

type InvoiceSummaryListProps = {
  invoices: InvoiceSummaryData[]
  disabled?: boolean
}

export function InvoiceSummaryList({ invoices, disabled = false }: InvoiceSummaryListProps) {
  return (
    <section className="grid gap-7 md:gap-8" aria-label={dashboardContent.labels.vouches}>
      {invoices.map((invoice) => (
        <InvoiceSummary
          key={invoice.vouchId ?? invoice.invoiceNumber}
          {...invoice}
          disabled={disabled || invoice.disabled === true}
        />
      ))}
    </section>
  )
}
