import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <section className="mx-auto grid w-full max-w-3xl gap-5">
      <div>
        <p className="vouch-label text-blue-500">{label}</p>
        <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">{title}</h1>
      </div>
      <Card className="rounded-none border-2 border-neutral-800 bg-black/55">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="flex items-center gap-3">
            <Icon className="text-blue-500" />
            Provider-backed readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 py-5">
          <Badge className="w-fit rounded-none bg-blue-700 font-mono uppercase">
            {readiness.replaceAll("_", " ")}
          </Badge>
          <p className="text-sm text-neutral-300">{message}</p>
        </CardContent>
      </Card>
    </section>
  )
}
