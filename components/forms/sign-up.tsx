"use client"

import * as React from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

export function SignUp({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string
  label: string
  description?: string | undefined
  error?: string | undefined
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError {...(error ? { errors: [{ message: error }] } : {})} />
    </Field>
  )
}
