import "server-only"

import { auth } from "@clerk/nextjs/server"
import { unstable_noStore as noStore } from "next/cache"

import type { Prisma, VouchStatus } from "@/prisma/generated/prisma/client"

import {
  mapParticipantSafeAuditTimelineDTO,
  type ParticipantSafeAuditTimelineItemDTO,
} from "@/lib/dto/audit.mappers"
import {
  mapPaymentRecordParticipantDTO,
  type PaymentRecordParticipantDTO,
} from "@/lib/dto/payment.mappers"
import {
  getAggregateConfirmationStatus,
  getWindowState,
  mapVouchCardDTO,
  mapVouchConfirmationStateDTO,
  mapVouchDetailDTO,
  mapVouchWindowSummaryDTO,
  type VouchCardDTO,
  type VouchConfirmationStateDTO,
  type VouchDetailDTO,
  type VouchWindowSummaryDTO,
} from "@/lib/dto/vouch.mappers"
import {
  calculateVouchPricing,
  DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS,
  DEFAULT_STRIPE_FIXED_CENTS,
  DEFAULT_STRIPE_PERCENT_BPS,
  DEFAULT_VOUCH_SERVICE_FEE_RATE,
} from "@/lib/vouch/fees"
import { prisma } from "@/lib/db/prisma"
import { hashInvitationToken } from "@/lib/invitations/tokens"
import { getAcceptVouchSetupGate, getCreateVouchSetupGate } from "@/lib/fetchers/setupFetchers"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import {
  vouchCardSelect,
  vouchConfirmationStateSelect,
  vouchDetailAcceptedSelect,
  vouchDetailAuthorizedSelect,
  vouchDetailBaseSelect,
  vouchDetailCommittedSelect,
  vouchDetailCompletedSelect,
  vouchDetailConfirmableSelect,
  vouchDetailExpiredSelect,
  vouchDetailProviderFailureSelect,
  vouchDetailSentSelect,
  vouchPaymentSummarySelect,
  vouchTimelineSelect,
  vouchWindowSummarySelect,
  whatHappensNextSelect,
} from "@/lib/db/selects/vouch.selects"
import { invitationTokenLookupSelect } from "@/lib/db/selects/invitation.selects"
import { participantSafeAuditTimelineItemSelect } from "@/lib/db/selects/audit.selects"

const DEFAULT_PAGE_SIZE = 20

type VouchCardRecord = Prisma.VouchGetPayload<{ select: typeof vouchCardSelect }>
type VouchDetailRecord = Prisma.VouchGetPayload<{ select: typeof vouchDetailBaseSelect }>
type VouchConfirmationRecord = Prisma.VouchGetPayload<{
  select: typeof vouchConfirmationStateSelect
}>
type VouchWindowRecord = Prisma.VouchGetPayload<{ select: typeof vouchWindowSummarySelect }>
type VouchPaymentRecord = Prisma.VouchGetPayload<{ select: typeof vouchPaymentSummarySelect }>
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

type StatusFilterInput = {
  userId?: string
  status?: VouchStatus
  page?: number
  pageSize?: number
}

function pageArgs(input?: { page?: number; pageSize?: number }) {
  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

function calculateFee(amountCents: number) {
  return calculateVouchPricing({ protectedAmountCents: amountCents })
}

async function getOptionalCurrentUserId() {
  const session = await auth()
  if (!session.userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    select: { id: true },
  })

  return user?.id ?? null
}

async function requireParticipantVouch(
  vouchId: string,
  select: VouchDetailSelect = vouchDetailBaseSelect
): Promise<unknown | null> {
  noStore()

  const user = await requireActiveUser()

  return prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ merchantId: user.id }, { customerId: user.id }],
    },
    select,
  })
}

async function readParticipantVouchByState(
  vouchId: string,
  variant: string,
  select: VouchDetailSelect = vouchDetailBaseSelect
) {
  const vouch = await requireParticipantVouch(vouchId, select)

  return {
    variant: vouch ? variant : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchDetailDTO(vouch as VouchDetailRecord) : null,
  }
}

async function getInvitationByToken(token: string) {
  noStore()

  return prisma.invitation.findFirst({
    where: { tokenHash: await hashInvitationToken(token) },
    select: invitationTokenLookupSelect,
  })
}

export async function getCreateVouchPageState(input?: { userId?: string }) {
  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id
  const gate = await getCreateVouchSetupGate(userId)

  return {
    variant: gate.allowed ? "ready" : "blocked",
    userId,
    gate,
  }
}

export async function getCreateVouchBlockedState(userId: string) {
  const gate = await getCreateVouchSetupGate(userId)

  return {
    variant: "blocked",
    userId,
    gate,
  }
}

export async function getCreateVouchFeePreview(input: { amountCents: number; currency?: string }) {
  const amountCents = Math.max(0, Math.trunc(input.amountCents))
  const pricing = calculateFee(amountCents)

  return {
    amountCents,
    protectedAmountCents: pricing.protectedAmountCents,
    currency: input.currency ?? "usd",
    merchantReceivesCents: pricing.merchantReceivesCents,
    vouchServiceFeeCents: pricing.vouchServiceFeeCents,
    processingFeeOffsetCents: pricing.processingFeeOffsetCents,
    applicationFeeAmountCents: pricing.applicationFeeAmountCents,
    customerTotalCents: pricing.customerTotalCents,
    totalCents: pricing.customerTotalCents,
    feeModel: {
      minimumFeeCents: DEFAULT_MINIMUM_VOUCH_SERVICE_FEE_CENTS,
      basisPoints: Math.round(DEFAULT_VOUCH_SERVICE_FEE_RATE * 10_000),
      stripePercentBps: DEFAULT_STRIPE_PERCENT_BPS,
      stripeFixedCents: DEFAULT_STRIPE_FIXED_CENTS,
    },
  }
}

export async function getCreateVouchReviewState(input: {
  amountCents: number
  currency?: string
  appointmentStartsAt?: string | Date | null
  confirmationOpensAt?: string | Date | null
  confirmationExpiresAt?: string | Date | null
  label?: string | null
}) {
  const user = await requireActiveUser()
  const gate = await getCreateVouchSetupGate(user.id)
  const fee = await getCreateVouchFeePreview(input)

  return {
    variant: gate.allowed ? "review" : "blocked",
    userId: user.id,
    gate,
    draft: {
      amountCents: fee.amountCents,
      protectedAmountCents: fee.protectedAmountCents,
      currency: fee.currency,
      merchantReceivesCents: fee.merchantReceivesCents,
      vouchServiceFeeCents: fee.vouchServiceFeeCents,
      processingFeeOffsetCents: fee.processingFeeOffsetCents,
      applicationFeeAmountCents: fee.applicationFeeAmountCents,
      customerTotalCents: fee.customerTotalCents,
      totalCents: fee.totalCents,
      appointmentStartsAt: input.appointmentStartsAt
        ? new Date(input.appointmentStartsAt).toISOString()
        : null,
      confirmationOpensAt: input.confirmationOpensAt
        ? new Date(input.confirmationOpensAt).toISOString()
        : null,
      confirmationExpiresAt: input.confirmationExpiresAt
        ? new Date(input.confirmationExpiresAt).toISOString()
        : null,
      label: input.label ?? null,
    },
  }
}

export async function getCreateVouchSuccessState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "created", vouchDetailSentSelect)
}

export async function getCreateVouchPaymentProcessingState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payment_processing", vouchPaymentSummarySelect)
}

export async function getCreateVouchPaymentFailedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payment_failed", vouchDetailProviderFailureSelect)
}

export async function getInviteLandingState(token: string) {
  const userId = await getOptionalCurrentUserId()

  if (!userId) {
    return getInviteLandingUnauthenticatedState(token)
  }

  return getInviteLandingAuthenticatedState({ token, userId })
}

export async function getInviteLandingUnauthenticatedState(token: string) {
  const invitation = await getInvitationByToken(token)

  if (!invitation) return getInviteInvalidState(token)
  if (invitation.expiresAt <= new Date()) return getInviteExpiredState(token)
  if (invitation.status === "accepted") return getInviteAlreadyAcceptedState(token)

  return {
    variant: "unauthenticated",
    token,
    invitation,
    signInHref: `/sign-in?return_to=${encodeURIComponent(`/vouches/${invitation.vouchId}`)}`,
    signUpHref: `/sign-up?return_to=${encodeURIComponent(`/vouches/${invitation.vouchId}`)}`,
  }
}

export async function getInviteLandingAuthenticatedState(input: {
  token: string
  userId?: string
}) {
  const invitation = await getInvitationByToken(input.token)

  if (!invitation) return getInviteInvalidState(input.token)
  if (invitation.expiresAt <= new Date()) return getInviteExpiredState(input.token)
  if (invitation.status === "accepted") return getInviteAlreadyAcceptedState(input.token)

  if (invitation.vouch.merchantId === input.userId) {
    return getSelfAcceptanceDeniedState({
      token: input.token,
      vouchId: invitation.vouchId,
    })
  }

  const gate = input.userId
    ? await getAcceptVouchSetupGate({ userId: input.userId })
    : { allowed: false, blockers: ["unauthorized"] }

  return {
    variant: gate.allowed ? "authenticated_ready" : "setup_blocked",
    token: input.token,
    invitation,
    gate,
  }
}

export async function getInviteInvalidState(token: string) {
  return {
    variant: "invalid_invite",
    token,
    title: "This invite is not valid.",
  }
}

export async function getInviteExpiredState(token: string) {
  return {
    variant: "expired_invite",
    token,
    title: "This invite has expired.",
  }
}

export async function getInviteAlreadyAcceptedState(token: string) {
  return {
    variant: "already_accepted",
    token,
    title: "This invite was already accepted.",
  }
}

export async function getInvitedVouchSummary(token: string) {
  return getInvitationByToken(token)
}

export async function getAcceptVouchPageState(input: { token: string; userId?: string }) {
  const user = input.userId ? { id: input.userId } : await requireActiveUser()
  return getInviteLandingAuthenticatedState({ token: input.token, userId: user.id })
}

export async function getAcceptVouchSetupBlockedState(input: { token: string; userId: string }) {
  const gate = await getAcceptVouchSetupGate({ userId: input.userId })

  return {
    variant: "setup_blocked",
    token: input.token,
    gate,
  }
}

export async function getAcceptVouchPayoutRequiredState(input: { token: string; userId: string }) {
  const gate = await getAcceptVouchSetupGate({ userId: input.userId })

  return {
    variant: "payout_required",
    token: input.token,
    gate,
  }
}

export async function getAcceptVouchTermsRequiredState(input: { token: string; userId: string }) {
  const gate = await getAcceptVouchSetupGate({ userId: input.userId })

  return {
    variant: "terms_required",
    token: input.token,
    gate,
  }
}

export async function getSelfAcceptanceDeniedState(input: { token?: string; vouchId?: string }) {
  return {
    variant: "self_acceptance_denied",
    token: input.token ?? null,
    vouchId: input.vouchId ?? null,
    title: "You cannot accept your own Vouch.",
  }
}

export async function listUserVouches(input?: StatusFilterInput): Promise<VouchCardDTO[]> {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = pageArgs(input)

  const where: Prisma.VouchWhereInput = {
    OR: [{ merchantId: userId }, { customerId: userId }],
    ...(input?.status ? { status: input.status } : {}),
  }

  const rows = await prisma.vouch.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: vouchCardSelect,
  })

  return rows.map((row) => mapVouchCardDTO(row))
}

export async function listMerchantVouches(input?: StatusFilterInput): Promise<VouchCardDTO[]> {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = pageArgs(input)

  const rows = await prisma.vouch.findMany({
    where: {
      merchantId: userId,
      ...(input?.status ? { status: input.status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: vouchCardSelect,
  })

  return rows.map((row) => mapVouchCardDTO(row))
}

export async function listCustomerVouches(input?: StatusFilterInput): Promise<VouchCardDTO[]> {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = pageArgs(input)

  const rows = await prisma.vouch.findMany({
    where: {
      customerId: userId,
      ...(input?.status ? { status: input.status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: vouchCardSelect,
  })

  return rows.map((row) => mapVouchCardDTO(row))
}

export async function getVouchDetailForParticipant(input: {
  vouchId: string
}): Promise<
  | { variant: string; vouch: VouchDetailDTO | null }
  | { variant: string; vouchId: string; title: string }
> {
  const vouch = (await requireParticipantVouch(
    input.vouchId,
    vouchDetailBaseSelect
  )) as VouchDetailRecord | null

  if (!vouch) return getVouchDetailUnauthorizedOrNotFoundState(input.vouchId)

  return {
    variant: "detail",
    vouch: mapVouchDetailDTO(vouch),
  }
}

export async function getVouchDetailCommittedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "committed", vouchDetailCommittedSelect)
}

export async function getVouchDetailSentState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "sent", vouchDetailSentSelect)
}

export async function getVouchDetailAcceptedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "accepted", vouchDetailAcceptedSelect)
}

export async function getVouchDetailAuthorizedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "authorized", vouchDetailAuthorizedSelect)
}

export async function getVouchDetailConfirmableState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "confirmable", vouchDetailConfirmableSelect)
}

export async function getVouchDetailMerchantConfirmedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "merchant_confirmed", vouchDetailConfirmableSelect)
}

export async function getVouchDetailCustomerConfirmedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "customer_confirmed", vouchDetailConfirmableSelect)
}

export async function getVouchDetailProcessingCaptureState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "processing_capture", vouchPaymentSummarySelect)
}

export async function getVouchDetailCompletedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "completed", vouchDetailCompletedSelect)
}

export async function getVouchDetailExpiredState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "expired", vouchDetailExpiredSelect)
}

export async function getVouchDetailFailedPaymentState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "provider_payment_failure",
    vouchDetailProviderFailureSelect
  )
}

export async function getVouchDetailFailedReleaseState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "provider_capture_failure",
    vouchDetailProviderFailureSelect
  )
}

export async function getVouchDetailFailedRefundState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "provider_refund_failure",
    vouchDetailProviderFailureSelect
  )
}

export async function getVouchDetailUnauthorizedOrNotFoundState(vouchId: string) {
  return {
    variant: "unauthorized_or_not_found",
    vouchId,
    title: "Vouch not found.",
  }
}

export async function getConfirmPresencePageState(input: { vouchId: string }) {
  noStore()

  const user = await requireActiveUser()
  const vouch = (await requireParticipantVouch(
    input.vouchId,
    vouchConfirmationStateSelect
  )) as VouchConfirmationRecord | null

  if (!vouch) return getConfirmUnauthorizedState(input.vouchId)

  const dto = mapVouchConfirmationStateDTO(vouch)
  const currentUserConfirmed = dto.presenceConfirmations.some(
    (confirmation) => confirmation.userId === user.id && confirmation.status === "confirmed"
  )

  if (dto.windowState === "before_window") return getConfirmBeforeWindowState(input.vouchId)
  if (dto.windowState === "closed") return getConfirmWindowClosedState(input.vouchId)
  if (currentUserConfirmed) return getConfirmAlreadyConfirmedState(input.vouchId)
  if (dto.aggregateConfirmationStatus === "both_confirmed") {
    return getConfirmBothConfirmedSuccessState(input.vouchId)
  }

  if (vouch.merchantId === user.id) return getConfirmPresenceMerchantState(input.vouchId)
  if (vouch.customerId === user.id) return getConfirmPresenceCustomerState(input.vouchId)

  return getConfirmUnauthorizedState(input.vouchId)
}

export async function getConfirmPresenceMerchantState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "confirm_as_merchant", vouchConfirmationStateSelect)
}

export async function getConfirmPresenceCustomerState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "confirm_as_customer", vouchConfirmationStateSelect)
}

export async function getConfirmBeforeWindowState(vouchId: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchWindowSummarySelect
  )) as VouchWindowRecord | null

  return {
    variant: vouch ? "before_window" : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchWindowSummaryDTO(vouch) : null,
  }
}

export async function getConfirmWindowOpenState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "window_open", vouchConfirmationStateSelect)
}

export async function getConfirmAlreadyConfirmedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "already_confirmed", vouchConfirmationStateSelect)
}

export async function getConfirmWaitingForOtherPartyState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "waiting_for_other_party",
    vouchConfirmationStateSelect
  )
}

export async function getConfirmBothConfirmedSuccessState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "both_confirmed", vouchConfirmationStateSelect)
}

export async function getConfirmWindowClosedState(vouchId: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchWindowSummarySelect
  )) as VouchWindowRecord | null

  return {
    variant: vouch ? "window_closed" : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchWindowSummaryDTO(vouch) : null,
  }
}

export async function getConfirmDuplicateErrorState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "duplicate_confirmation",
    vouchConfirmationStateSelect
  )
}

export async function getConfirmUnauthorizedState(vouchId: string) {
  return {
    variant: "unauthorized",
    vouchId,
    title: "You cannot confirm this Vouch.",
  }
}

export async function getConfirmProviderFailureState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "provider_failure", vouchDetailProviderFailureSelect)
}

export async function getShareVouchState(vouchId: string) {
  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      merchantId: user.id,
      status: { in: ["committed", "sent"] },
    },
    select: vouchDetailSentSelect,
  })

  return {
    variant: vouch ? "share" : "unavailable",
    vouch: vouch ? mapVouchDetailDTO(vouch) : null,
  }
}

export async function getInviteLinkState(vouchId: string) {
  const state = await getShareVouchState(vouchId)
  const invitation = state.vouch?.invitation ?? null

  return {
    variant: invitation ? "invite_link_ready" : "invite_missing",
    vouchId,
    invitation,
  }
}

export async function getSendInvitationState(vouchId: string) {
  const state = await getShareVouchState(vouchId)

  return {
    variant: state.vouch ? "send_invitation" : "unavailable",
    vouchId,
    vouch: state.vouch,
  }
}

export async function getVouchConfirmationState(
  vouchId: string
): Promise<VouchConfirmationStateDTO | null> {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchConfirmationStateSelect
  )) as VouchConfirmationRecord | null

  return vouch ? mapVouchConfirmationStateDTO(vouch) : null
}

export async function getVouchWindowSummary(
  vouchId: string
): Promise<VouchWindowSummaryDTO | null> {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchWindowSummarySelect
  )) as VouchWindowRecord | null

  return vouch ? mapVouchWindowSummaryDTO(vouch) : null
}

export async function getVouchPaymentSummary(
  vouchId: string
): Promise<PaymentRecordParticipantDTO | null> {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchPaymentSummarySelect
  )) as VouchPaymentRecord | null

  return mapPaymentRecordParticipantDTO(vouch?.paymentRecord)
}

export async function getVouchTimeline(vouchId: string): Promise<VouchDetailDTO | null> {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchTimelineSelect
  )) as VouchTimelineRecord | null

  return vouch ? mapVouchDetailDTO(vouch) : null
}

export async function getParticipantSafeAuditTimeline(
  vouchId: string
): Promise<ParticipantSafeAuditTimelineItemDTO[]> {
  noStore()

  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ merchantId: user.id }, { customerId: user.id }],
    },
    select: { id: true },
  })

  if (!vouch) return []

  const rows = await prisma.auditEvent.findMany({
    where: {
      entityType: "Vouch",
      entityId: vouchId,
      participantSafe: true,
    },
    orderBy: { createdAt: "asc" },
    select: participantSafeAuditTimelineItemSelect,
  })

  return mapParticipantSafeAuditTimelineDTO(rows)
}

export async function getWhatHappensNextState(vouchId: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    whatHappensNextSelect
  )) as VouchDetailRecord | null

  if (!vouch) {
    return {
      variant: "unauthorized_or_not_found",
      vouchId,
    }
  }

  const dto = mapVouchDetailDTO(vouch)
  const aggregateStatus = getAggregateConfirmationStatus(dto.presenceConfirmations)
  const windowState = getWindowState({
    confirmationOpensAt: dto.confirmationOpensAt,
    confirmationExpiresAt: dto.confirmationExpiresAt,
  })

  if (dto.status === "committed" || dto.status === "sent") {
    return {
      variant: "waiting_for_acceptance",
      vouch: dto,
      message: "The customer must accept before authorization can happen.",
    }
  }

  if (dto.status === "accepted") {
    return {
      variant: "waiting_for_authorization",
      vouch: dto,
      message: "Payment authorization must complete before confirmation.",
    }
  }

  if (dto.status === "authorized" && windowState === "before_window") {
    return {
      variant: "waiting_for_window",
      vouch: dto,
      message: "Confirmation opens at the scheduled window.",
    }
  }

  if (
    (dto.status === "authorized" || dto.status === "confirmable") &&
    windowState === "open" &&
    aggregateStatus !== "both_confirmed"
  ) {
    return {
      variant: "confirmation_required",
      vouch: dto,
      message: "Both participants must confirm before the window closes.",
    }
  }

  if (aggregateStatus === "both_confirmed" && dto.status !== "completed") {
    return {
      variant: "capture_pending",
      vouch: dto,
      message: "Both participants confirmed. Settlement follows provider state.",
    }
  }

  if (dto.status === "completed") {
    return {
      variant: "completed",
      vouch: dto,
      message: "Both participants confirmed and funds released.",
    }
  }

  if (dto.status === "expired") {
    return {
      variant: "non_capture",
      vouch: dto,
      message: "Both confirmations were not completed in time, so funds did not release.",
    }
  }

  return {
    variant: "status",
    vouch: dto,
    message: "Review the current Vouch status.",
  }
}

/**
 * Compatibility aliases retained only for older imports during migration.
 */
export const listPayerVouches = listMerchantVouches
export const listPayeeVouches = listCustomerVouches
export const getVouchDetailPendingPayerState = getVouchDetailCommittedState
export const getVouchDetailPendingInviteSentState = getVouchDetailSentState
export const getVouchDetailActiveBeforeWindowState = getVouchDetailAuthorizedState
export const getVouchDetailActiveWindowOpenState = getVouchDetailConfirmableState
export const getVouchDetailPayerConfirmedState = getVouchDetailMerchantConfirmedState
export const getVouchDetailPayeeConfirmedState = getVouchDetailCustomerConfirmedState
export const getVouchDetailProcessingReleaseState = getVouchDetailProcessingCaptureState
export const getVouchDetailRefundedState = getVouchDetailExpiredState
export const getConfirmPresencePayerState = getConfirmPresenceMerchantState
export const getConfirmPresencePayeeState = getConfirmPresenceCustomerState
