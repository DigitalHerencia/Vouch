// components/brand/wordmark.tsx

import Image from "next/image"

export function Wordmark({ asImage = true }: WordmarkProps) {
  if (asImage) {
    return (
      <span className="inline-flex items-center" aria-label="Vouch">
        <Image
          src="/VOUCHdark.png"
          alt="Vouch"
          width={240}
          height={80}
          priority
          className="h-10 w-auto object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className="font-(family-name:--font-brand) tracking-normal text-white uppercase"
      aria-label="Vouch"
    >
      Vouch
    </span>
  )
}
