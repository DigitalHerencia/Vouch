import Image from "next/image"

import { cn } from "@/lib/utils"

export interface VerificationMarkProps {
  className?: string
}

export function VerificationMark({ className }: VerificationMarkProps) {
  return (
    <Image
      src="/handshake.png"
      alt=""
      width={40}
      height={40}
      className={cn("size-10 object-contain", className)}
    />
  )
}
