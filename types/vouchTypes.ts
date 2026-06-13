import type {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  PARTICIPANT_ROLE_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"
import type { ISODateTime } from "./commonTypes"
import type { ReactNode } from "react"

type VouchFormStepId = "disclaimer" | "appointment" | "cart"
type VouchStatusTimelineState = "completed" | "current" | "upcoming"
type VouchAuditDisplayItem = { label: string; value: string }
type VouchDetailPageTitle = { eyebrow?: string; title: string; description?: string }
type VouchDetailRefreshWindow = {
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
} | null
type VouchDetailConfirmationAction = {
  canConfirm: boolean
  confirmationExpiresAt: ISODateTime | null
  authorizationCheckoutUrl: string | null
  currentUserCode?: string
}
type NextVouchActionKind =
  | "commit"
  | "accept"
  | "authorize"
  | "confirm_presence"
  | "waiting"
  | "readiness_required"
  | "view_outcome"
  | "none"

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
export type AggregateConfirmationStatus = (typeof AGGREGATE_CONFIRMATION_STATUS_VALUES)[number]
export type ConfirmationMethod = (typeof CONFIRMATION_METHOD_VALUES)[number]
export type VouchListSort = (typeof VOUCH_LIST_SORT_VALUES)[number]

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

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
  action?: ReactNode
}

export type VouchDetailDisplayDTO = {
  pageTitle: VouchDetailPageTitle
  document: VouchStatusDocumentData
  refreshWindow: VouchDetailRefreshWindow
  confirmationAction: VouchDetailConfirmationAction
}

export type ConfirmationWindowInput = {
  now?: DateLike
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

export type NextVouchAction = {
  kind: NextVouchActionKind
  label: string
  href?: string
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

export type VouchPricingInput = {
  protectedAmountCents: number
}

export type VouchPricing = {
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  customerTotalCents: number
}

export type CreateVouchDraftFormValues = {
  disclaimerAccepted: boolean
  appointmentStartsAt: string
  amountDollars: string
}
