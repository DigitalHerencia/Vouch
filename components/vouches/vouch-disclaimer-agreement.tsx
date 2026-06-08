// components/vouches/vouch-disclaimer-agreement.tsx

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
    <main className="mx-auto flex max-w-2xl flex-col items-center">
      <label className="text-xl font-semibold text-white">
        Vouch coordinates payment state through third-party providers. Vouch does not directly
        custody funds, hold card data, store bank data, or act as a funds custodian.
      </label>
      <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
          className="mt-1 border-neutral-400"
        />
        <span className="uppercase">
          I agree to the
          <Button asChild variant="nav" size="nav" className="ml-2">
            <Link href="/legal/disclaimer" target="_blank" rel="noreferrer">
              Disclaimer
            </Link>
          </Button>
        </span>
      </div>

      {error ? <p className="text-sm leading-5 font-semibold text-red-600">{error}</p> : null}
    </main>
  )
}
