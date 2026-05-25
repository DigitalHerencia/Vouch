// components/app/app-providers.tsx

"use client"

import { ClerkProvider } from "@clerk/nextjs"
import type { ReactNode } from "react"

type AppProviderProps = Readonly<{
  children: ReactNode
}>

export function AppProvider({ children }: AppProviderProps) {
  return <ClerkProvider>{children}</ClerkProvider>
}
