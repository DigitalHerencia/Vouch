// components/vouches/vouch-creation-field.tsx

import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"

export function VouchCreationField({
  label,
  children,
  error,
}: {
  label: string
  children: ReactNode
  error?: string | undefined
}) {
  return (
    <div className="grid gap-2.5">
      <Label className="text-xs font-black tracking-widest text-blue-600 uppercase">{label}</Label>
      {children}
      {error ? <p className="text-sm leading-5 font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}
