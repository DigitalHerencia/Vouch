import type {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  ARCHIVE_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  CONFIRMATION_STATUS_VALUES,
  CONFIRM_PRESENCE_VARIANT_VALUES,
  INVITATION_STATUS_VALUES,
  PARTICIPANT_ROLE_VALUES,
  PAYMENT_ROLE_MAP,
  RECOVERY_STATUS_VALUES,
  VOUCH_DETAIL_VARIANT_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_LIST_STATUS_FILTER_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"

import type { CurrencyCode, ISODateTime, MoneyCents, VouchID } from "./commonTypes"

export type VouchStatus = (typeof VOUCH_STATUS_VALUES)[number]
export type InvitationStatus = (typeof INVITATION_STATUS_VALUES)[number]
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
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
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
  participantSafe: boolean
}

/**
 * Backward-compatible aliases retained only to keep Pass 4 isolated.
 * Later passes should migrate call sites to CreateVouchDraftInput / ConfirmCreateVouchInput.
 */
export type CreateVouchInput = ConfirmCreateVouchInput
export type AcceptVouchInput = {
  vouchId: VouchID
  disclaimerAccepted: true
}

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

export type VouchStatusStepState = "completed" | "current" | "upcoming"

export interface VouchStatusTimelineItem {
  id: string
  title: string
  description: string
  timeLabel?: string
  state: VouchStatusStepState
  meta?: string
}

export interface VouchCountdownProps {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
}

export interface VouchStatusDocumentData {
  title: string
  publicId: string
  status: string
  statusTone?: VouchStatusTone
  amountLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  confirmationOpensLabel: string
  confirmationExpiresLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  countdown?: VouchCountdownProps
  timeline: VouchStatusTimelineItem[]
  confirmations: {
    merchantConfirmed: boolean
    customerConfirmed: boolean
    action?: React.ReactNode
  }
  audit?: Array<{ label: string; value: string }>
}

export type VouchCreationDraft = {
  amountDollars: string
  appointmentStartsAt: string
  confirmationOpensAt: string
  confirmationExpiresAt: string
  disclaimerAccepted: boolean
}

export type VouchCreationPreviewData = {
  amountCents?: number
  customerTotalCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  detailPath?: string
  checkoutUrl?: string
}

export type VouchCreationActionResult =
  | {
      ok: true
      data?: VouchCreationPreviewData
    }
  | {
      ok: false
      formError?: string
      fieldErrors?: Record<string, string[]>
    }

export interface VouchCreationWizardContent {
  eyebrow: string
  title: string
  helper: string
  progressHint: string
  amountDescription: string
  cartTitle: string
  cartDescription: string
  immutableAcknowledgement: string
  steps: readonly { title: string; completeLabel: string; pendingLabel: string }[]
  protocolTiles: readonly { title: string; body: string }[]
  cartRail: readonly { label: string; value: string }[]
}

export interface VouchCreationWizardProps {
  content: VouchCreationWizardContent
  currentStep: number
  optimisticStep: number
  savedStepIndexes: readonly number[]
  draft: VouchCreationDraft
  preview?: VouchCreationPreviewData | undefined
  fieldErrors?: Record<string, string[]> | undefined
  formError?: string | null | undefined
  cartOpen: boolean
  isPending: boolean
  onDraftChange: (patch: Partial<VouchCreationDraft>) => void
  onStepSelect: (stepIndex: number) => void
  onBack: () => void
  onSaveAmount: () => void
  onSaveWindow: () => void
  onReviewCart: () => void
  onCartOpenChange: (open: boolean) => void
  onCreateVouch: () => void
}

type ConfirmationState = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
  canConfirm: boolean
  action?: ReactNode
}

type VouchDetailPageProps = {
  vouchId: string
}

type VouchDetailViewProps = {
  title: string
  amountLabel: string
  statusLabel: VouchStatus | string
  currentUserRoleLabel: "merchant" | "customer" | "participant"
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  confirmation: ConfirmationState
  timeline: { label: string; timestampLabel: string }[]
}

export interface VouchCreationFeatureClientProps {
  initialDraft?: Partial<VouchCreationDraft>
  onSaveAmount: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onSaveWindow: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onCreateVouch: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
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

export type ConfirmationStateInput = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

export type VouchDetailVariant =
  | "draft"
  | "committed"
  | "sent"
  | "accepted"
  | "authorized"
  | "confirmable_before_window"
  | "confirmable_window_open"
  | "merchant_confirmed_waiting_for_customer"
  | "customer_confirmed_waiting_for_merchant"
  | "both_confirmed_processing_capture"
  | "completed"
  | "expired"

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
  stripePercentBps?: number
  stripeFixedCents?: number
}

export type VouchPricing = {
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  customerTotalCents: number
  applicationFeeAmountCents: number
}

type ConfirmationCodeInput = {
  vouchId: string
  publicId: string
  participantRole: ParticipantRole
  participantUserId: string
  at?: Date
}

type VerifyConfirmationCodeInput = ConfirmationCodeInput & {
  submittedCode: string
  allowedBucketSkew?: number
}

type VouchDetailRecord = Prisma.VouchGetPayload<{ select: typeof vouchDetailBaseSelect }>

type VouchConfirmationRecord = Prisma.VouchGetPayload<{
  select: typeof vouchConfirmationStateSelect
}>

type VouchWindowRecord = Prisma.VouchGetPayload<{ select: typeof vouchWindowSummarySelect }>

type VouchTimelineRecord = Prisma.VouchGetPayload<{ select: typeof vouchTimelineSelect }>

type VouchDetailSelect =
  | typeof vouchDetailBaseSelect
  | typeof vouchDetailCommittedSelect
  | typeof vouchDetailSentSelect
  | typeof vouchDetailAcceptedSelect
  | typeof vouchDetailAuthorizedSelect
  | typeof vouchDetailConfirmableSelect
  | typeof vouchDetailCompletedSelect
  | typeof vouchDetailExpiredSelect
  | typeof vouchDetailProviderFailureSelect
  | typeof vouchPaymentSummarySelect
  | typeof vouchTimelineSelect
  | typeof vouchWindowSummarySelect
  | typeof vouchConfirmationStateSelect
  | typeof whatHappensNextSelect

type VouchCardRecord = Prisma.VouchGetPayload<{ select: typeof vouchCardSelect }>

type PresenceConfirmationRecord = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: string
  method: string
  confirmedAt: DateLike
  serverReceivedAt?: DateLike
  timeBucket?: number | null
  clockSkewAccepted?: boolean
  createdAt: DateLike
}

type InvitationRecord = {
  id: string
  vouchId: string
  status: string
  expiresAt: DateLike
  openedAt: DateLike
  acceptedAt: DateLike
  declinedAt: DateLike
  createdAt: DateLike
  updatedAt: DateLike
}

type VouchBaseRecord = {
  id: string
  publicId?: string
  merchantId?: string
  customerId?: string | null
  status: VouchStatus
  archiveStatus?: string
  recoveryStatus?: string
  currency?: string
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
  label?: string | null
  appointmentStartsAt?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
  committedAt?: DateLike
  sentAt?: DateLike
  acceptedAt?: DateLike
  authorizedAt?: DateLike
  confirmableAt?: DateLike
  completedAt?: DateLike
  expiredAt?: DateLike
  createdAt?: DateLike
  updatedAt?: DateLike
  merchant?: SafeUserRecord
  customer?: SafeUserRecord | null
  invitation?: InvitationRecord | null
  presenceConfirmations?: PresenceConfirmationRecord[]
  paymentRecords?: Parameters<typeof mapPaymentRecordParticipantDTO>[0][]
  refundRecords?: Parameters<typeof mapRefundRecordParticipantDTOs>[0]
}

export type PresenceConfirmationDTO = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: string
  method: string
  confirmedAt: ISODateTime | null
  serverReceivedAt: ISODateTime | null
  timeBucket: number | null
  clockSkewAccepted: boolean
  createdAt: ISODateTime | null
}

export type InvitationDTO = {
  id: string
  vouchId: string
  status: string
  expiresAt: ISODateTime | null
  openedAt: ISODateTime | null
  acceptedAt: ISODateTime | null
  declinedAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
}

export type VouchCardDTO = {
  id: string
  publicId: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  archiveStatus: string
  currency: string
  protectedAmountCents: number
  protectedAmount: MoneyDTO
  customerTotalCents: number
  customerTotal: MoneyDTO
  appointmentStartsAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
  merchant: SafeUserDTO | null
  customer: SafeUserDTO | null
  paymentRecord: PaymentRecordParticipantDTO | null
  presenceConfirmations: PresenceConfirmationDTO[]
  aggregateConfirmationStatus: AggregateConfirmationStatus
}

export type VouchDetailDTO = VouchCardDTO & {
  recoveryStatus: string
  merchantReceivesCents: number
  merchantReceives: MoneyDTO
  vouchServiceFeeCents: number
  vouchServiceFee: MoneyDTO
  processingFeeOffsetCents: number
  processingFeeOffset: MoneyDTO
  applicationFeeAmountCents: number
  applicationFeeAmount: MoneyDTO
  label: string | null
  committedAt: ISODateTime | null
  sentAt: ISODateTime | null
  acceptedAt: ISODateTime | null
  authorizedAt: ISODateTime | null
  confirmableAt: ISODateTime | null
  completedAt: ISODateTime | null
  expiredAt: ISODateTime | null
  invitation: InvitationDTO | null
  refundRecords: RefundRecordParticipantDTO[]
  windowState: "before_window" | "open" | "closed"
}

export type VouchWindowSummaryDTO = {
  id: string
  status: VouchStatus
  appointmentStartsAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  windowState: "before_window" | "open" | "closed"
}

export type VouchConfirmationStateDTO = {
  id: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  presenceConfirmations: PresenceConfirmationDTO[]
  aggregateConfirmationStatus: AggregateConfirmationStatus
  windowState: "before_window" | "open" | "closed"
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

type DashboardVouchRecord = Parameters<typeof mapVouchCardDTO>[0]

type VouchResult = {
  id: string
  publicId: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  archiveStatus: ArchiveStatus
  recoveryStatus: RecoveryStatus
  currency: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  label: string | null
  appointmentStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  committedAt: Date | null
  sentAt: Date | null
  acceptedAt: Date | null
  authorizedAt: Date | null
  confirmableAt: Date | null
  completedAt: Date | null
  expiredAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type CreateVouchTxInput = {
  merchantId: string
  customerId?: string | null
  publicId?: string
  currency?: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  label?: string | null
  appointmentStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  createAsDraft?: boolean
  createAsSent?: boolean
}

type VouchIdTxInput = {
  vouchId: string
}

type BindCustomerToVouchTxInput = {
  vouchId: string
  customerId: string
}

type VouchRecoveryStatusTxInput = {
  vouchId: string
  recoveryStatus: RecoveryStatus
}

type VouchArchiveStatusTxInput = {
  vouchId: string
  archiveStatus: ArchiveStatus
}

type CreateInvitationTxInput = {
  vouchId: string
  recipientEmail?: string | null
  tokenHash: string
  expiresAt: Date
}

type InvitationIdTxInput = {
  invitationId: string
}

type RotateInvitationTokenHashTxInput = {
  invitationId: string
  tokenHash: string
  expiresAt?: Date
}

type InvitationResult = {
  id: string
  vouchId: string
  tokenHash: string
  recipientEmail: string | null
  status: InvitationStatus
  expiresAt: Date
  openedAt: Date | null
  acceptedAt: Date | null
  declinedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type AggregateConfirmationStatus =
  | "none_confirmed"
  | "merchant_confirmed"
  | "customer_confirmed"
  | "both_confirmed"

type CreatePresenceConfirmationTxInput = {
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  method: ConfirmationMethod
  confirmedAt?: Date
  serverReceivedAt?: Date
  timeBucket?: number | null
  clockSkewAccepted?: boolean
  offlinePayloadHash?: string | null
}

type AssertNoDuplicateConfirmationTxInput = {
  vouchId: string
  userId: string
  participantRole: ParticipantRole
}

type VouchIdTxInput = {
  vouchId: string
}

type PresenceConfirmationResult = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: ConfirmationStatus
  method: ConfirmationMethod
  confirmedAt: Date | null
  serverReceivedAt: Date
  timeBucket: number | null
  clockSkewAccepted: boolean
  createdAt: Date
}

type FeePreview = {
  amountCents: number
  currency: "usd"
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  totalCents: number
}

type CreatedVouchResult = {
  vouchId: string
  invitationId: string
  detailPath: string
  checkoutUrl?: string
}

type AcceptedVouchResult = {
  vouchId: string
  checkoutUrl?: string
}

type InvitationByToken = Awaited<ReturnType<typeof getInvitationByToken>>

type UsableInvitation = NonNullable<InvitationByToken>

export type CreateVouchDraftInput = z.infer<typeof createVouchDraftSchema>

export type ConfirmCreateVouchInput = z.infer<typeof confirmCreateVouchSchema>

export type ConfirmPresenceInput = z.infer<typeof confirmPresenceSchema>

export type ArchiveVouchInput = z.infer<typeof archiveVouchSchema>

export type VouchListSearchParams = z.infer<typeof vouchListSearchParamsSchema>

export type CreateVouchInput = ConfirmCreateVouchInput
