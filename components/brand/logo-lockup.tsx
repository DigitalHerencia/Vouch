// components/brand/logo-lockup.tsx

import Image from "next/image"

import { cn } from "@/lib/utils"

export interface LogoLockupProps {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function LogoLockup({ className, imageClassName, priority = true }: LogoLockupProps) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Vouch">
      <Image
        src="/VOUCHdark.png"
        alt="Vouch"
        width={360}
        height={120}
        priority={priority}
        sizes="(max-width: 768px) 144px, 180px"
        className={cn("h-10 w-auto object-contain sm:h-11", imageClassName)}
      />
    </span>
  )
}
