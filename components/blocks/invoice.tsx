import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Download, Printer, Mail, Check, Clock, AlertCircle } from "lucide-react"

// ============================================================================
// Common Types
// ============================================================================
export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  unitPriceLabel?: string
  total?: number
  totalLabel?: string
}

export interface InvoiceAddress {
  name: string
  company?: string
  address: string
  city: string
  state?: string
  zip: string
  country?: string
  email?: string
  phone?: string
}

export interface InvoiceData {
  title?: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status?: "paid" | "pending" | "overdue" | string
  from: InvoiceAddress
  to: InvoiceAddress
  items: InvoiceItem[]
  subtotal: number
  tax?: { label: string; rate: number; amount: number }
  discount?: { label: string; amount: number }
  total: number
  notes?: string
  terms?: string
  details?: Array<{ label: string; value: string }>
  actions?: React.ReactNode
  paymentInfo?: {
    bankName?: string
    accountNumber?: string
    routingNumber?: string
    paymentMethods?: string[]
  }
}

// ============================================================================
// INVOICE VARIANT 1: Full Invoice
// ============================================================================
export interface InvoiceProps {
  data: InvoiceData
  logo?: React.ReactNode
  onDownload?: () => void
  onPrint?: () => void
  onSendEmail?: () => void
  className?: string
}

export function Invoice({ data, logo, onDownload, onPrint, onSendEmail, className }: InvoiceProps) {
  const computedSubtotal = data.items.reduce(
    (sum, item) => sum + (item.total ?? item.quantity * item.unitPrice),
    0
  )
  const computedTotal = computedSubtotal + (data.tax?.amount ?? 0) - (data.discount?.amount ?? 0)

  if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
    if (Math.abs(computedSubtotal - data.subtotal) > 0.01) {
      console.warn(
        `[Invoice] subtotal mismatch: passed ${data.subtotal.toFixed(2)}, computed ${computedSubtotal.toFixed(2)}`
      )
    }
    if (Math.abs(computedTotal - data.total) > 0.01) {
      console.warn(
        `[Invoice] total mismatch: passed ${data.total.toFixed(2)}, computed ${computedTotal.toFixed(2)}`
      )
    }
  }

  const statusConfig = {
    paid: { bg: "bg-success", text: "text-success-foreground", icon: Check },
    pending: { bg: "bg-warning", text: "text-warning-foreground", icon: Clock },
    overdue: { bg: "bg-destructive", text: "text-destructive-foreground", icon: AlertCircle },
  }

  const status =
    data.status && data.status in statusConfig
      ? statusConfig[data.status as keyof typeof statusConfig]
      : null

  return (
    <div className={cn("mx-auto max-w-4xl", className)}>
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-black uppercase">Invoice</h1>
        <div className="flex gap-2">
          {onSendEmail && (
            <Button variant="outline" size="sm" onClick={onSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
          {onDownload && (
            <Button size="sm" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="border-3 border-foreground bg-card shadow-[8px_8px_0px_hsl(var(--shadow-color))] print:border-0 print:shadow-none">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              {logo && <div className="mb-4">{logo}</div>}
              <AddressBlock address={data.from} />
            </div>

            <div className="space-y-2 text-left md:text-right">
              <h2 className="text-4xl font-black tracking-tight uppercase">
                {data.title ?? "Invoice"}
              </h2>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-bold text-muted-foreground uppercase">Invoice #:</span>{" "}
                  <span className="font-medium">{data.invoiceNumber}</span>
                </p>
                <p>
                  <span className="font-bold text-muted-foreground uppercase">Issue Date:</span>{" "}
                  <span className="font-medium">{data.issueDate}</span>
                </p>
                <p>
                  <span className="font-bold text-muted-foreground uppercase">Due Date:</span>{" "}
                  <span className="font-medium">{data.dueDate}</span>
                </p>
              </div>
              {status && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase",
                    status.bg,
                    status.text
                  )}
                >
                  <status.icon className="h-3 w-3" />
                  {data.status}
                </div>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 border-3 border-foreground bg-muted/30 p-4">
            <p className="mb-2 text-xs font-bold text-muted-foreground uppercase">Bill To</p>
            <AddressBlock address={data.to} />
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-3 border-foreground">
                  <th className="py-3 text-left text-sm font-black uppercase">Description</th>
                  <th className="w-24 py-3 text-center text-sm font-black uppercase">Qty</th>
                  <th className="w-32 py-3 text-right text-sm font-black uppercase">Unit Price</th>
                  <th className="w-32 py-3 text-right text-sm font-black uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={`invoice-item-${item.description}`}
                    className="border-b border-foreground/20"
                  >
                    <td className="py-4">{item.description}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right font-mono">
                      {item.unitPriceLabel ?? `$${item.unitPrice.toFixed(2)}`}
                    </td>
                    <td className="py-4 text-right font-mono font-bold">
                      {item.totalLabel ??
                        `$${(item.total || item.quantity * item.unitPrice).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mb-8 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-bold">${data.subtotal.toFixed(2)}</span>
              </div>
              {data.tax && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    {data.tax.label} ({data.tax.rate}%)
                  </span>
                  <span className="font-mono">${data.tax.amount.toFixed(2)}</span>
                </div>
              )}
              {data.discount && (
                <div className="text-success flex justify-between py-2">
                  <span>{data.discount.label}</span>
                  <span className="font-mono">-${data.discount.amount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="h-0.5 bg-foreground" />
              <div className="flex justify-between py-2">
                <span className="text-lg font-black uppercase">Total</span>
                <span className="font-mono text-2xl font-black">${data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {data.paymentInfo && (
            <div className="mb-8 border-3 border-foreground bg-primary/5 p-4">
              <p className="mb-3 text-xs font-bold text-muted-foreground uppercase">
                Payment Information
              </p>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                {data.paymentInfo.bankName && (
                  <div>
                    <p className="font-bold">Bank Name</p>
                    <p className="text-muted-foreground">{data.paymentInfo.bankName}</p>
                  </div>
                )}
                {data.paymentInfo.accountNumber && (
                  <div>
                    <p className="font-bold">Account Number</p>
                    <p className="font-mono text-muted-foreground">
                      {data.paymentInfo.accountNumber}
                    </p>
                  </div>
                )}
                {data.paymentInfo.routingNumber && (
                  <div>
                    <p className="font-bold">Routing Number</p>
                    <p className="font-mono text-muted-foreground">
                      {data.paymentInfo.routingNumber}
                    </p>
                  </div>
                )}
                {data.paymentInfo.paymentMethods && (
                  <div>
                    <p className="font-bold">Accepted Methods</p>
                    <p className="text-muted-foreground">
                      {data.paymentInfo.paymentMethods.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          {(data.notes || data.terms) && (
            <div className="grid gap-6 text-sm md:grid-cols-2">
              {data.notes && (
                <div>
                  <p className="mb-2 text-xs font-bold text-muted-foreground uppercase">Notes</p>
                  <p className="text-muted-foreground">{data.notes}</p>
                </div>
              )}
              {data.terms && (
                <div>
                  <p className="mb-2 text-xs font-bold text-muted-foreground uppercase">
                    Terms & Conditions
                  </p>
                  <p className="text-muted-foreground">{data.terms}</p>
                </div>
              )}
            </div>
          )}
          {data.details && (
            <div className="mt-8 grid gap-3 text-sm md:grid-cols-2">
              {data.details.map((detail) => (
                <div key={detail.label} className="border-2 border-foreground p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    {detail.label}
                  </p>
                  <p className="mt-1">{detail.value}</p>
                </div>
              ))}
            </div>
          )}
          {data.actions && <div className="mt-8">{data.actions}</div>}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INVOICE VARIANT 2: Compact Receipt
// ============================================================================
export interface ReceiptData {
  receiptNumber: string
  date: string
  merchant: {
    name: string
    address?: string
    phone?: string
  }
  items: Array<{
    name: string
    quantity?: number
    price: number
  }>
  subtotal: number
  tax?: number
  total: number
  paymentMethod?: string
  cardLast4?: string
}

export interface ReceiptProps {
  data: ReceiptData
  logo?: React.ReactNode
  onDownload?: () => void
  className?: string
}

export function Receipt({ data, logo, onDownload, className }: ReceiptProps) {
  return (
    <div className={cn("mx-auto max-w-sm", className)}>
      <div className="border-3 border-foreground bg-card shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            {logo && <div className="mb-4 flex justify-center">{logo}</div>}
            <h2 className="text-xl font-black uppercase">{data.merchant.name}</h2>
            {data.merchant.address && (
              <p className="text-sm text-muted-foreground">{data.merchant.address}</p>
            )}
            {data.merchant.phone && (
              <p className="text-sm text-muted-foreground">{data.merchant.phone}</p>
            )}
          </div>

          <Separator className="h-0.5 border-dashed bg-foreground" />

          {/* Receipt Info */}
          <div className="space-y-1 text-center text-sm">
            <p className="font-bold uppercase">Receipt #{data.receiptNumber}</p>
            <p className="text-muted-foreground">{data.date}</p>
          </div>

          <Separator className="h-0.5 border-dashed bg-foreground" />

          {/* Items */}
          <div className="space-y-2">
            {data.items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span>
                  {item.quantity && item.quantity > 1 && `${item.quantity}x `}
                  {item.name}
                </span>
                <span className="font-mono">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="h-0.5 border-dashed bg-foreground" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">${data.subtotal.toFixed(2)}</span>
            </div>
            {data.tax !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">${data.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span className="uppercase">Total</span>
              <span className="font-mono text-lg">${data.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="h-0.5 border-dashed bg-foreground" />

          {/* Payment Method */}
          {data.paymentMethod && (
            <div className="space-y-1 text-center text-sm">
              <p className="text-muted-foreground">Paid with {data.paymentMethod}</p>
              {data.cardLast4 && <p className="font-mono">•••• {data.cardLast4}</p>}
            </div>
          )}

          {/* Thank You */}
          <div className="text-center">
            <p className="text-sm font-bold uppercase">Thank You!</p>
          </div>

          {/* Download */}
          {onDownload && (
            <Button variant="outline" className="w-full print:hidden" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INVOICE VARIANT 3: Invoice Summary Card
// ============================================================================
export interface InvoiceSummaryProps {
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  amount: number
  amountLabel?: string
  status: "paid" | "pending" | "overdue" | string
  href?: string
  onView?: () => void
  onDownload?: () => void
  className?: string
}

export function InvoiceSummary({
  invoiceNumber,
  clientName,
  issueDate,
  dueDate,
  amount,
  amountLabel,
  status,
  href,
  onView,
  onDownload,
  className,
}: InvoiceSummaryProps) {
  const statusConfig = {
    paid: { bg: "bg-success/10", border: "border-success", text: "text-success" },
    pending: { bg: "bg-warning/10", border: "border-warning", text: "text-warning" },
    overdue: { bg: "bg-destructive/10", border: "border-destructive", text: "text-destructive" },
  }

  const statusStyle =
    status in statusConfig
      ? statusConfig[status as keyof typeof statusConfig]
      : statusConfig.pending

  return (
    <div
      className={cn(
        "border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_hsl(var(--shadow-color))] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_hsl(var(--shadow-color))]",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-lg font-black">{invoiceNumber}</p>
          <p className="text-sm text-muted-foreground">{clientName}</p>
        </div>
        <div
          className={cn(
            "border-2 px-2 py-1 text-xs font-bold uppercase",
            statusStyle.bg,
            statusStyle.border,
            statusStyle.text
          )}
        >
          {status}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">Issued</p>
          <p className="font-medium">{issueDate}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">Due</p>
          <p className="font-medium">{dueDate}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-mono text-2xl font-black">{amountLabel ?? `$${amount.toFixed(2)}`}</p>
        <div className="flex gap-2">
          {onDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          {(onView || href) && (
            <Button size="sm" onClick={onView} asChild={!!href}>
              {href ? <a href={href}>View</a> : "View"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INVOICE VARIANT 4: Invoice List
// ============================================================================
export interface InvoiceListItem {
  id: string
  invoiceNumber: string
  clientName: string
  date: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

export interface InvoiceListProps {
  invoices: InvoiceListItem[]
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  className?: string
}

export function InvoiceList({ invoices, onView, onDownload, className }: InvoiceListProps) {
  const statusConfig = {
    paid: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    overdue: "bg-destructive text-destructive-foreground",
  }

  return (
    <div className={cn("border-3 border-foreground bg-card", className)}>
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 border-b-3 border-foreground bg-muted/50 p-4 text-xs font-bold uppercase">
        <div className="col-span-2">Invoice</div>
        <div className="col-span-3">Client</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-right">Status</div>
        <div className="col-span-1" />
      </div>

      {/* Rows */}
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid grid-cols-12 items-center gap-2 border-b border-foreground/20 p-4 transition-colors hover:bg-muted/30"
        >
          <div className="col-span-2 truncate font-bold">{invoice.invoiceNumber}</div>
          <div className="col-span-3 truncate text-muted-foreground">{invoice.clientName}</div>
          <div className="col-span-2 text-sm text-muted-foreground">{invoice.date}</div>
          <div className="col-span-2 text-right font-mono font-bold">
            ${invoice.amount.toFixed(2)}
          </div>
          <div className="col-span-2 flex justify-end">
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-bold whitespace-nowrap uppercase",
                statusConfig[invoice.status]
              )}
            >
              {invoice.status}
            </span>
          </div>
          <div className="col-span-1 flex items-center justify-end gap-1">
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onDownload(invoice.id)}
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onView(invoice.id)}
              >
                →
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================
function AddressBlock({ address }: { address: InvoiceAddress }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-bold">{address.name}</p>
      {address.company && <p>{address.company}</p>}
      <p className="text-muted-foreground">{address.address}</p>
      <p className="text-muted-foreground">
        {address.city}
        {address.state && `, ${address.state}`} {address.zip}
      </p>
      {address.country && <p className="text-muted-foreground">{address.country}</p>}
      {address.email && <p className="text-muted-foreground">{address.email}</p>}
      {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const InvoiceBlocks = {
  Full: Invoice,
  Receipt: Receipt,
  Summary: InvoiceSummary,
  List: InvoiceList,
}
