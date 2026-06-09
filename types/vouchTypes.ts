import type {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  ARCHIVE_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  CONFIRMATION_STATUS_VALUES,
  CONFIRM_PRESENCE_VARIANT_VALUES,
  PARTICIPANT_ROLE_VALUES,
  PAYMENT_ROLE_MAP,
  RECOVERY_STATUS_VALUES,
  VOUCH_DETAIL_VARIANT_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_LIST_STATUS_FILTER_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"
import type { CurrencyCode, ISODateTime, MoneyCents, VouchID } from "./commonTypes"
import type { ResolutionPaymentStatus } from "./paymentTypes"
import type { ReactNode } from "react"

export type VouchFormStepId = "disclaimer" | "appointment" | "cart"

export type VouchFormStep = {
  id: VouchFormStepId
  title: string
  description?: string
  icon?: ReactNode
  content: ReactNode
  canContinue?: boolean
  optional?: boolean
  actionLabel?: string
}

export type VouchFormPageTitleProps = {
  eyebrow?: string
  title: string
  description?: string
  variant?: "hero" | "page"
}

export type DateLike = Date | string | number

export type VouchStatus = (typeof VOUCH_STATUS_VALUES)[number]
export type ParticipantRole = (typeof PARTICIPANT_ROLE_VALUES)[number]
export type PaymentRoleAlias = (typeof PAYMENT_ROLE_MAP)[ParticipantRole]
export type ConfirmationStatus = (typeof CONFIRMATION_STATUS_VALUES)[number]
export type AggregateConfirmationStatus = (typeof AGGREGATE_CONFIRMATION_STATUS_VALUES)[number]
export type ConfirmationMethod = (typeof CONFIRMATION_METHOD_VALUES)[number]
export type ArchiveStatus = (typeof ARCHIVE_STATUS_VALUES)[number]
export type RecoveryStatus = (typeof RECOVERY_STATUS_VALUES)[number]
export type VouchListStatusFilter = (typeof VOUCH_LIST_STATUS_FILTER_VALUES)[number]
export type VouchListSort = (typeof VOUCH_LIST_SORT_VALUES)[number]
export type VouchDetailVariant = (typeof VOUCH_DETAIL_VARIANT_VALUES)[number]
export type ConfirmPresenceVariant = (typeof CONFIRM_PRESENCE_VARIANT_VALUES)[number]

export interface CreateVouchDraftInput {
  amountCents: MoneyCents
  currency: CurrencyCode
  appointmentStartsAt: ISODateTime
}

export interface ConfirmCreateVouchInput extends CreateVouchDraftInput {
  disclaimerAccepted: true
}

export interface FeePreviewInput {
  amountCents: MoneyCents
  currency: CurrencyCode
}

export interface ConfirmPresenceInput {
  vouchId: VouchID
  submittedCode: string
  method: ConfirmationMethod
}

export interface ArchiveVouchInput {
  vouchId: VouchID
}

export interface VouchListQuery {
  status?: VouchListStatusFilter
  page?: number
  sort?: VouchListSort
}

export interface VouchAppointmentDTO {
  appointmentStartsAt: ISODateTime
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
  appointmentLabel: string
  confirmationWindowLabel: string
}

export interface VouchConfirmationDTO {
  aggregateStatus: AggregateConfirmationStatus
  merchantConfirmed: boolean
  customerConfirmed: boolean
  windowState: "before_window" | "open" | "closed"
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
  canCurrentUserConfirm: boolean
  consequenceText: string
}

export interface VouchActionDTO {
  id: string
  label: string
  description?: string
  disabled?: boolean
  reason?: string
}

export interface VouchTimelineItemDTO {
  id: string
  label: string
  body: string
  occurredAt: ISODateTime
}

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

export type VouchStatusTimelineState = "completed" | "current" | "upcoming"

export type VouchCountdownProps = {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  startsAt?: ISODateTime
  expiresAt?: ISODateTime
  percentRemaining?: number
  tone?: VouchStatusTone
}

export type VouchStatusTimelineItem = {
  id: string
  title: string
  description: string
  state: VouchStatusTimelineState
  timeLabel?: string
  meta?: string
}

export type VouchAuditDisplayItem = {
  label: string
  value: string
}

export type VouchStatusDocumentData = {
  title: string
  publicId: string
  status: string
  statusTone?: VouchStatusTone
  amountLabel: string
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  confirmationOpensLabel: string
  confirmationExpiresLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  authorizationCheckoutUrl?: string | null
  countdown?: VouchCountdownProps
  confirmations: {
    merchantConfirmed: boolean
    customerConfirmed: boolean
    action?: ReactNode
  }
  timeline: VouchStatusTimelineItem[]
  audit?: VouchAuditDisplayItem[]
}

export type VouchDetailPageTitle = {
  eyebrow?: string
  title: string
  description?: string
}

export type VouchDetailRefreshWindow = {
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
} | null

export type VouchDetailConfirmationAction = {
  canConfirm: boolean
  confirmationExpiresAt: ISODateTime | null
  authorizationCheckoutUrl: string | null
  currentUserCode?: string
}

export type VouchDetailDisplayDTO = {
  pageTitle: VouchDetailPageTitle
  document: VouchStatusDocumentData
  refreshWindow: VouchDetailRefreshWindow
  confirmationAction: VouchDetailConfirmationAction
}

export type CreateVouchInput = ConfirmCreateVouchInput
export type AcceptVouchInput = {
  vouchId: VouchID
  disclaimerAccepted: true
}

export type ConfirmationWindowInput = {
  now?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
}

export type ValidConfirmationWindowInput = {
  meetingStartsAt?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
}

export type ConfirmationStateInput = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

export type VouchTransition = {
  from: VouchStatus
  to: VouchStatus
}

export type NextVouchActionKind =
  | "commit"
  | "accept"
  | "authorize"
  | "confirm_presence"
  | "waiting"
  | "readiness_required"
  | "view_outcome"
  | "none"

export type NextVouchAction = {
  kind: NextVouchActionKind
  label: string
  href?: string
}

export type DeriveDetailVariantInput = ConfirmationStateInput & {
  status: VouchStatus
  now?: DateLike
  confirmationOpensAt?: DateLike
  confirmationExpiresAt?: DateLike
  paymentCapturePending?: boolean
}

export type DeriveNextVouchActionInput = ConfirmationStateInput & {
  vouchId?: string
  status: VouchStatus
  role: ParticipantRole
  now?: DateLike
  confirmationOpensAt?: DateLike
  confirmationExpiresAt?: DateLike
  readinessBlocked?: boolean
}

export type ReleaseResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  paymentStatus?: ResolutionPaymentStatus
}

export type ExpirationResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  now?: DateLike
  confirmationExpiresAt: DateLike
}

export type VouchPricingInput = {
  protectedAmountCents: number
}

export type VouchPricing = {
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  customerTotalCents: number
}

export type CreateVouchDraft = {
  disclaimerAccepted: boolean
  appointmentStartsAt: string
  amountDollars: string
}

export type CreateVouchDraftFormValues = {
  disclaimerAccepted: boolean
  appointmentStartsAt: string
  amountDollars: string
}
