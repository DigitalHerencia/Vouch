import type { ReactNode } from "react"
import type { PrismaClient } from "@/prisma/generated/prisma/client"

export type ID = string
export type ISODateTime = string
export type NullableDateLike = Date | string | null | undefined
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>

export interface NotFoundPageProps {
  title?: string
  description?: string
  showSearch?: boolean
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  onSearch?: (query: string) => void
  homeHref?: string
  backHref?: string
}

export interface ServerErrorPageProps {
  title?: string
  description?: string
  errorId?: string
  onRetry?: () => void
  homeHref?: string
  supportEmail?: string
}

export interface MaintenancePageProps {
  title?: string
  description?: string
  estimatedTime?: string
  features?: string[]
  statusPageUrl?: string
}

export interface OfflinePageProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export interface ForbiddenPageProps {
  title?: string
  description?: string
  homeHref?: string
  loginHref?: string
}

export interface ComingSoonPageProps {
  title?: string
  description?: string
  launchDate?: Date
  onNotify?: (email: string) => void
  email?: string
  onEmailChange?: (email: string) => void
  submitted?: boolean
  timeRemaining?: { days: number; hours: number; minutes: number } | null
}

export interface GenericErrorPageProps {
  icon?: ReactNode
  title?: string
  description?: string
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "outline"
  }>
}
