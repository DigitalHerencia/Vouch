import type { z } from "zod"
import type {
  currencyCodeSchema,
  dateRangeInputSchema,
  idSchema,
  isoDateTimeSchema,
  moneyCentsSchema,
  paginationInputSchema,
  percentageBasisPointsSchema,
  publicIdSchema,
  userIdSchema,
  vouchIdSchema,
  invitationTokenSchema,
} from "@/schemas/common"

export type ID = z.infer<typeof idSchema>
export type PublicID = z.infer<typeof publicIdSchema>
export type UserID = z.infer<typeof userIdSchema>
export type VouchID = z.infer<typeof vouchIdSchema>
export type InvitationToken = z.infer<typeof invitationTokenSchema>
export type ISODateTime = z.infer<typeof isoDateTimeSchema>
export type CurrencyCode = z.infer<typeof currencyCodeSchema>
export type MoneyCents = z.infer<typeof moneyCentsSchema>
export type PercentageBasisPoints = z.infer<typeof percentageBasisPointsSchema>

export type Environment = "development" | "preview" | "production"
export type SortDirection = "asc" | "desc"
export type AsyncStatus = "idle" | "pending" | "success" | "error"
export type PageMode = "default" | "loading" | "error" | "empty" | "blocked" | "success"
export type DeviceVariant = "desktop" | "mobile"

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      code?: string
      formError?: string
      fieldErrors?: Record<string, string[]>
    }

export type PaginationInput = z.infer<typeof paginationInputSchema>

export interface PaginationState {
  page: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

export type DateRangeInput = z.infer<typeof dateRangeInputSchema>

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