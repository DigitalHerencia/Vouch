import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { VouchCreationField } from "@/components/vouches/vouch-creation-field"

type VouchDisclaimerAgreementProps = {
  checked: boolean
  disabled?: boolean | undefined
  error?: string | undefined
  onCheckedChange: (checked: boolean) => void
}

export function VouchDisclaimerAgreement({
  checked,
  disabled,
  error,
  onCheckedChange,
}: VouchDisclaimerAgreementProps) {
  return (
    <div className="grid gap-4">
      <label className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 bg-black p-1">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
          className="mt-1 border-neutral-400"
        />
        <span className="max-w-prose text-sm leading-6 font-semibold text-neutral-300">
          Vouch coordinates payment state through third-party providers. Vouch does not directly
          custody funds, hold card data, store bank data, or act as a funds custodian.
          <span className="mt-3 block">
            I agree to the
            <Button asChild variant="nav" size="nav" className="ml-2">
              <Link href="/legal/disclaimer" target="_blank" rel="noreferrer">
                Disclaimer
              </Link>
            </Button>
            .
          </span>
        </span>
      </label>
      {error ? <p className="text-sm leading-5 font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

type VouchDateTimeFieldProps = {
  value: string
  disabled?: boolean | undefined
  error?: string | undefined
  onChange: (value: string) => void
}

export function VouchDateTimeField({
  value,
  disabled,
  error,
  onChange,
}: VouchDateTimeFieldProps) {
  return (
    <VouchCreationField label="Appointment date and time" error={error}>
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
