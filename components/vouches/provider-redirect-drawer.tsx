"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ProtocolDrawer } from "@/components/vouches/protocol-drawer"

export interface ProviderRedirectDrawerProps {
  action: (formData: FormData) => void | Promise<void>
  label: string
  title: string
  consequence: string
  context: string
  finePrint: string
  variant?: "nav" | "primary"
}

export function ProviderRedirectDrawer({
  action,
  label,
  title,
  consequence,
  context,
  finePrint,
  variant = "nav",
}: ProviderRedirectDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant === "nav" ? "link" : "default"}
        size={variant === "nav" ? "nav" : "default"}
        onClick={() => setOpen(true)}
      >
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
              Continue to provider
              <ArrowRight className="ml-auto size-5" />
            </Button>
          </form>
        }
      />
    </>
  )
}
