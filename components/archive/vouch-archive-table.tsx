import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { VouchStatusBadge } from "@/components/shared/vouch-status-badge"
import { Button } from "@/components/ui/button"
import type { VouchArchiveListItem } from "@/types/dashboardTypes"

export function VouchArchiveTable({ vouches }: { vouches: VouchArchiveListItem[] }) {
  return (
    <div className="overflow-x-auto border-3 border-neutral-400 bg-black shadow-vouch-lg">
      <table className="w-full min-w-3xl border-collapse text-left">
        <thead className="border-b-3 border-neutral-400">
          <tr className="text-xs font-black tracking-widest text-neutral-400 uppercase">
            <th scope="col" className="px-4 py-4 md:px-5">
              Vouch
            </th>
            <th scope="col" className="px-4 py-4 md:px-5">
              Participant
            </th>
            <th scope="col" className="px-4 py-4 md:px-5">
              Appointment
            </th>
            <th scope="col" className="px-4 py-4 text-right md:px-5">
              Amount
            </th>
            <th scope="col" className="px-4 py-4 text-right md:px-5">
              Status
            </th>
            <th scope="col" className="px-4 py-4 md:px-5">
              <span className="sr-only">View Vouch</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {vouches.map((vouch) => (
            <tr
              key={vouch.id}
              className="border-b border-neutral-700 transition-colors last:border-b-0 hover:bg-neutral-950"
            >
              <td className="px-4 py-4 font-mono text-xs font-black text-white uppercase md:px-5">
                {vouch.publicId}
              </td>
              <td className="px-4 py-4 font-bold text-neutral-300 md:px-5">
                {vouch.participantName}
              </td>
              <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap text-neutral-400 md:px-5">
                {vouch.appointmentLabel}
              </td>
              <td className="px-4 py-4 text-right font-mono font-black whitespace-nowrap text-white md:px-5">
                {vouch.amountLabel}
              </td>
              <td className="px-4 py-4 text-right md:px-5">
                <VouchStatusBadge status={vouch.statusLabel} tone={vouch.tone} />
              </td>
              <td className="px-4 py-4 text-right md:px-5">
                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                  <Link href={vouch.href} aria-label={`View Vouch ${vouch.publicId}`}>
                    <ArrowRight />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
