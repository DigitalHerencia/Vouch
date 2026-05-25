"use client"

import { Invoice, InvoiceList, InvoiceSummary, Receipt } from "@/components/blocks/invoice"

const invoiceData = {
  invoiceNumber: "INV-2026-001",
  issueDate: "May 20, 2026",
  dueDate: "May 27, 2026",
  status: "pending" as const,
  from: {
    name: "Vouch Operations",
    company: "Digital Herencia",
    address: "100 Plaza St",
    city: "Albuquerque",
    state: "NM",
    zip: "87102",
    email: "billing@example.com",
  },
  to: {
    name: "Client Account",
    address: "500 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    email: "client@example.com",
  },
  items: [
    { description: "Commitment coordination", quantity: 1, unitPrice: 750, total: 750 },
    { description: "Provider reconciliation", quantity: 1, unitPrice: 250, total: 250 },
  ],
  subtotal: 1000,
  tax: { label: "Tax", rate: 0, amount: 0 },
  total: 1000,
  notes: "Funds release only after both parties confirm in time.",
  terms: "Payment state is coordinated through the payment provider.",
}

const receiptData = {
  receiptNumber: "RCT-2026-001",
  date: "May 20, 2026",
  merchant: {
    name: "Vouch",
    address: "Nuevo Mexico",
    phone: "(555) 010-2026",
  },
  items: [
    { name: "Vouch fee", quantity: 1, price: 50 },
    { name: "Payment coordination", quantity: 1, price: 950 },
  ],
  subtotal: 1000,
  tax: 0,
  total: 1000,
  paymentMethod: "Card",
  cardLast4: "4242",
}

const invoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    clientName: "Client One",
    date: "May 20, 2026",
    amount: 1000,
    status: "paid" as const,
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    clientName: "Client Two",
    date: "May 21, 2026",
    amount: 1250,
    status: "pending" as const,
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    clientName: "Client Three",
    date: "May 22, 2026",
    amount: 750,
    status: "overdue" as const,
  },
]

export function InvoiceFeatureClient() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <Invoice
          data={invoiceData}
          onDownload={() => undefined}
          onPrint={() => undefined}
          onSendEmail={() => undefined}
        />
        <Receipt data={receiptData} onDownload={() => undefined} />
        <InvoiceSummary
          invoiceNumber="INV-2026-002"
          clientName="Vouch Client"
          issueDate="May 20, 2026"
          dueDate="May 27, 2026"
          amount={1000}
          status="pending"
          onView={() => undefined}
          onDownload={() => undefined}
        />
        <InvoiceList invoices={invoices} onView={() => undefined} onDownload={() => undefined} />
      </section>
    </main>
  )
}
