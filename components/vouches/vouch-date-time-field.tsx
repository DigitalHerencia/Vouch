// components/vouches/vouch-date-time-field.tsx

import { Input } from "@/components/ui/input"
import { VouchCreationField } from "@/components/vouches/vouch-creation-field"
import { vouchPageCopy } from "@/content/vouches"

type VouchDateTimeFieldProps = {
  value: string
  disabled?: boolean | undefined
  error?: string | undefined
  onChange: (value: string) => void
}

export function VouchDateTimeField({ value, disabled, error, onChange }: VouchDateTimeFieldProps) {
  return (
    <VouchCreationField label={vouchPageCopy.create.appointmentFieldLabel} error={error}>
      <Input
        type="datetime-local"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-none border-2 border-neutral-400 bg-black px-3 font-mono text-sm font-bold text-white disabled:opacity-50"
      />
    </VouchCreationField>
  )
}
