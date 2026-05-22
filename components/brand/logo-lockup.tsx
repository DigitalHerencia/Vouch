// components/brand/logo-lockup.tsx

import { Handshake } from "lucide-react"

export function LogoLockup() {
  return (
    <span className="inline-flex items-center gap-2.5 text-white" aria-label="Vouch">
      <Handshake className="size-7 text-blue-600 sm:size-8 lg:size-9" strokeWidth={2.4} />

      <span className="font-(family-name:--font-brand) text-[22px] leading-none tracking-normal text-white uppercase sm:text-[28px] lg:text-[34px]">
        Vouch
      </span>
    </span>
  )
}
