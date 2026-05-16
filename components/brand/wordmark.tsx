// components/brand/wordmark.tsx

import Image from "next/image"

import { cn } from "@/lib/utils"

export interface WordmarkProps {
  className?: string
  imageClassName?: string
  asImage?: boolean
}

export function Wordmark({ className, imageClassName, asImage = true }: WordmarkProps) {
  if (asImage) {
    return (
      <span className={cn("inline-flex items-center", className)} aria-label="Vouch">
        <Image
          src="/VOUCHdark.png"
          alt="Vouch"
          width={240}
          height={80}
          priority
          className={cn("h-10 w-auto object-contain", imageClassName)}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "font-(family-name:--font-brand) tracking-[-0.045em] text-white uppercase",
        className
      )}
      aria-label="Vouch"
    >
      Vouch
    </span>
  )
}
