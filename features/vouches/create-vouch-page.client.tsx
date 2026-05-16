"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { vouchPageCopy } from "@/content/vouches"

export function CreateVouchReadyPanel() {
  return (
    <Card className="rounded-none border-neutral-800 bg-black">
      <CardHeader>
        <CardTitle>{vouchPageCopy.create.detailsHeader}</CardTitle>
        <CardDescription>{vouchPageCopy.create.readyBody}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-neutral-400">Create Vouch form fields belong here: amount, appointment date/time, and confirmation window.</p>
      </CardContent>
    </Card>
  )
}