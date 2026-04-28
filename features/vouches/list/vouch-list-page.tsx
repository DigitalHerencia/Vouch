import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type VouchListItem = {
  id: string
  href: string
  title: string
  statusLabel: string
  roleLabel: string
  amountLabel: string
  deadlineLabel: string
  nextActionLabel?: string
}

type VouchListPageProps = { title?: string; items: VouchListItem[] }

export function VouchListPage({ title = "Vouches", items }: VouchListPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">Participant-scoped Vouches only.</p>
        </div>
        <Button render={<Link href="/vouches/new" />}>Create Vouch</Button>
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-6">
            <p className="font-medium">No Vouches yet.</p>
            <p className="text-muted-foreground text-sm">
              Create a Vouch to back an appointment or in-person agreement with a clear payment
              commitment.
            </p>
            <Button render={<Link href="/vouches/new" />}>Create Vouch</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Link href={item.href} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    {item.roleLabel} · {item.statusLabel} · {item.deadlineLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{item.amountLabel}</span>
                  {item.nextActionLabel ? (
                    <Button size="sm" render={<Link href={item.href} />}>
                      {item.nextActionLabel}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
