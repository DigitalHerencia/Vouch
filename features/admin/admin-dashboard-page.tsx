import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type AdminMetric = { label: string; value: string | number; href?: string; description?: string }

type AdminDashboardPageProps = { metrics: AdminMetric[] }

export function AdminDashboardPage({ metrics }: AdminDashboardPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div><h1 className="text-3xl font-semibold tracking-tight">Admin</h1><p className="text-muted-foreground">Operational inspection only. Admins do not arbitrate funds.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{metric.href ? <Link href={metric.href} className="hover:underline">{metric.label}</Link> : metric.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold tabular-nums">{metric.value}</p>{metric.description ? <p className="mt-2 text-sm text-muted-foreground">{metric.description}</p> : null}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
