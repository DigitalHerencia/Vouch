export type ID = string
export type PublicID = string
export type UserID = string
export type VouchID = string
export type InvitationToken = string
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
