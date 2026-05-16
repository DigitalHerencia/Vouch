import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"

export interface LifecycleStatusPanelProps {
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  labels: {
    appointment: string
    opens: string
    expires: string
  }
  title: string
}

export function LifecycleStatusPanel({
  appointmentLabel,
  windowLabel,
  deadlineLabel,
  labels,
  title,
}: LifecycleStatusPanelProps) {
  return (
    <Surface variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">{title}</h2>
      </SurfaceHeader>
      <SurfaceBody className="font-mono text-sm">
        <Line label={labels.appointment} value={appointmentLabel} />
        <Line label={labels.opens} value={windowLabel} />
        <Line label={labels.expires} value={deadlineLabel} />
      </SurfaceBody>
    </Surface>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-800 py-2">
      <span className="text-neutral-300">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
