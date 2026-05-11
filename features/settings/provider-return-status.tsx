import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"

type ProviderReturnStatusProps = {
  title: string
  label: string
  readiness: string
  message: string
}

export function ProviderReturnStatus({
  title,
  label,
  readiness,
  message,
}: ProviderReturnStatusProps) {
  const Icon =
    readiness === "ready"
      ? CheckCircle2
      : readiness === "failed" || readiness === "restricted"
        ? CircleAlert
        : LoaderCircle

  return (
    <section className="grid w-full gap-6">
      <SectionIntro eyebrow={label} title={title} />
      <Surface>
        <SurfaceHeader>
          <h2 className="flex items-center gap-3 font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
            <Icon className="text-blue-500" />
            Provider-backed readiness
          </h2>
        </SurfaceHeader>
        <SurfaceBody className="grid gap-4">
          <Badge className="w-fit rounded-none bg-blue-700 font-mono uppercase">
            {readiness.replaceAll("_", " ")}
          </Badge>
          <p className="text-sm text-neutral-300">{message}</p>
        </SurfaceBody>
      </Surface>
    </section>
  )
}
