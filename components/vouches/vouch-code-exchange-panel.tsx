import type { ReactNode } from "react"

export interface VouchCodeExchangePanelProps {
  children: ReactNode
}

export function VouchCodeExchangePanel({ children }: VouchCodeExchangePanelProps) {
  return <>{children}</>
}
