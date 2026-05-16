import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function LifecycleStatusPanel({ title, appointmentLabel, windowLabel, deadlineLabel, labels }: { title: string; appointmentLabel: string; windowLabel: string; deadlineLabel: string; labels: Record<string, string> }) {
  const rows = [[labels.appointment, appointmentLabel], [labels.opens, windowLabel], [labels.expires, deadlineLabel]]
  return <Card className="rounded-none border-neutral-800 bg-black"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="p-0">{rows.map(([label,value])=><div key={label} className="flex items-start justify-between gap-4 border-b border-neutral-800 px-5 py-4 last:border-b-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p><Badge className="rounded-none border-neutral-700 bg-neutral-950 text-neutral-300">{value}</Badge></div>)}</CardContent></Card>
}