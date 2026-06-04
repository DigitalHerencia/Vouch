import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Receipt({ data, logo, onDownload }: ReceiptProps) {
  return (
    <div className="mx-auto min-w-lg">
      <div className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className="space-y-6 p-6">
          <div className="space-y-2 text-center">
            {logo && <div className="mb-4 flex justify-center">{logo}</div>}
            <h2 className="font-black uppercase">{data.merchant.name}</h2>
            {data.merchant.address && (
              <p className="text-sm text-neutral-400">{data.merchant.address}</p>
            )}
            {data.merchant.phone && (
              <p className="text-sm text-neutral-400">{data.merchant.phone}</p>
            )}
          </div>

          <Separator className="h-0.5 border-dashed bg-neutral-900" />

          <div className="space-y-1 text-center text-sm">
            <p className="font-bold uppercase">Receipt #{data.receiptNumber}</p>
            <p className="text-neutral-400">{data.date}</p>
          </div>

          <Separator className="h-0.5 border-dashed bg-neutral-900" />

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

          <Separator className="h-0.5 border-dashed bg-neutral-900" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="font-mono">${data.subtotal.toFixed(2)}</span>
            </div>
            {data.tax !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Tax</span>
                <span className="font-mono">${data.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span className="uppercase">Total</span>
              <span className="font-mono text-lg">${data.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="h-0.5 border-dashed bg-neutral-900" />

          {data.paymentMethod && (
            <div className="space-y-1 text-center text-sm">
              <p className="text-neutral-400">Paid with {data.paymentMethod}</p>
              {data.cardLast4 && <p className="font-mono">•••• {data.cardLast4}</p>}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-bold uppercase">Thank You!</p>
          </div>

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
