import Image from "next/image"

export interface VerificationMarkProps {
  className?: string
}

export function VerificationMark({ className }: VerificationMarkProps) {
  return <Image src="/handshake.svg" alt="" width={32} height={32} className={className} />
}
