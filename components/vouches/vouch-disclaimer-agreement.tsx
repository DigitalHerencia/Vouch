import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

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
