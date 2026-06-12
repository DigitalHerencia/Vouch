// components/vouches/vouch-disclaimer-agreement.tsx

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { vouchPageCopy } from "@/content/vouches"

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
    <div className="grid max-w-2xl gap-5">
      <p className="max-w-xl text-left text-base leading-7 font-semibold text-neutral-200">
        {vouchPageCopy.create.disclaimerBody}
      </p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <Checkbox
          id="vouch-disclaimer-accepted"
          checked={checked}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "vouch-disclaimer-error" : undefined}
          onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
          className="mt-1 border-neutral-400"
        />
        <label htmlFor="vouch-disclaimer-accepted" className="uppercase">
          {vouchPageCopy.create.disclaimerAgreement}
          <Button asChild variant="nav" size="nav" className="ml-2">
            <Link href="/legal/disclaimer" target="_blank" rel="noreferrer">
              {vouchPageCopy.create.disclaimerLinkLabel}
            </Link>
          </Button>
        </label>
      </div>

      {error ? (
        <p id="vouch-disclaimer-error" className="text-sm leading-5 font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
