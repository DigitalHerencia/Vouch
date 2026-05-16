import type { ReactNode } from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

export function SignUpFieldGroup({ id, label, description, error, children }: { id: string; label: string; description?: string | undefined; error?: string | undefined; children: ReactNode }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  )
}