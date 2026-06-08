// components/vouches/vouch-amount-field.tsx

import { Input } from "@/components/ui/input"
import { VouchCreationField } from "@/components/vouches/vouch-creation-field"

type VouchAmountFieldProps = {
  value: string
  disabled?: boolean | undefined
  error?: string | undefined
  onChange: (value: string) => void
}

export function VouchAmountField({ value, disabled, error, onChange }: VouchAmountFieldProps) {
  return (
    <VouchCreationField label="Protected amount" error={error}>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="250.00"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-none border-2 border-neutral-400 bg-black px-3 font-mono text-sm font-bold text-white disabled:opacity-50"
      />
    </VouchCreationField>
  )
}
