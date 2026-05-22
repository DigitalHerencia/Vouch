"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ProtocolDrawer } from "@/components/vouches/protocol-drawer"

type ProviderAction = (formData: FormData) => void | Promise<void>

export function ProviderRedirectDrawer({
  action,
  label,
  title,
  consequence,
  context,
  finePrint,
}: {
  action: ProviderAction
  label: string
  title: string
  consequence: string
  context: string
  finePrint: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button type="button" variant="link" size="nav" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ProtocolDrawer
        open={open}
        onOpenChange={setOpen}
        title={title}
        consequence={consequence}
        context={context}
        finePrint={finePrint}
        primary={
          <form action={action}>
            <Button type="submit" className="w-full">
              Continue to Stripe
            </Button>
          </form>
        }
      />
    </>
  )
}
