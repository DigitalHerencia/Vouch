import Link from "next/link"

import { Button } from "@/components/ui/button"

export function InvoiceList({ invoices }: InvoiceListProps) {
  const statusConfig = {
    paid: "bg-blue-600 text-white",
    pending: "bg-blue-600 text-white",
    overdue: "bg-red-600 text-white",
  }

  return (
    <div className="border-3 border-neutral-400 bg-black">
      <h3 className="grid grid-cols-12 gap-2 border-b-3 border-neutral-400 bg-blue-600 p-4 font-black text-white uppercase">
        <div className="col-span-2">Invoice</div>
        <div className="col-span-3">Client</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1" />
        <div className="col-span-2 text-right">Status</div>
      </h3>

      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid grid-cols-12 items-center gap-2 border-b border-neutral-400 p-4 transition-colors hover:bg-black"
        >
          <div className="col-span-2 truncate font-bold">{invoice.invoiceNumber}</div>
          <div className="col-span-3 truncate text-neutral-400">{invoice.clientName}</div>
          <div className="col-span-2 text-sm text-neutral-400">{invoice.date}</div>
          <div className="col-span-2 text-right font-mono font-bold">
            ${invoice.amount.toFixed(2)}
          </div>
          <div className="col-span-2 flex justify-center">
            <Button variant="link" size="nav">
              <Link href="/">View</Link>
            </Button>
          </div>
          <div className="col-span-1 flex justify-end">
            <span
              className={`px-2 py-0.5 text-xs font-bold whitespace-nowrap uppercase ${statusConfig[invoice.status]}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
