import type { ReactNode } from "react"

export type ID = string
export type PublicID = string
export type UserID = string
export type VouchID = string
export type ISODateTime = string
export type CurrencyCode = "usd"
export type MoneyCents = number
export type PercentageBasisPoints = number

export type Environment = "development" | "preview" | "production"
export type SortDirection = "asc" | "desc"
export type AsyncStatus = "idle" | "pending" | "success" | "error"
export type PageMode = "default" | "loading" | "error" | "empty" | "blocked" | "success"
export type DeviceVariant = "desktop" | "mobile"

export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface PaginationState {
  page: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

export interface DateRangeInput {
  from?: ISODateTime
  to?: ISODateTime
}

export interface SelectOption<TValue extends string = string> {
  value: TValue
  label: string
  disabled?: boolean
}

export interface FieldErrorState {
  field: string
  message: string
}

export interface ServerErrorState {
  code: string
  title: string
  message: string
  retryable: boolean
}

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
