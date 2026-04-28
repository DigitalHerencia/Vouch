import "server-only"

import { auth } from "@clerk/nextjs/server"
import { unstable_noStore as noStore } from "next/cache"

import {
  calculatePlatformFeeCents,
  DEFAULT_MINIMUM_PLATFORM_FEE_CENTS,
  DEFAULT_PLATFORM_FEE_RATE,
} from "@/lib/vouch/fees"
import { prisma } from "@/lib/db/prisma"
import { hashInvitationToken } from "@/lib/invitations/tokens"
import { getAcceptVouchSetupGate, getCreateVouchSetupGate } from "@/lib/fetchers/setupFetchers"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import {
  vouchCardSelect,
  vouchConfirmationStateSelect,
  vouchDetailActiveBeforeWindowSelect,
  vouchDetailActiveWindowOpenSelect,
  vouchDetailBaseSelect,
  vouchDetailCompletedSelect,
  vouchDetailExpiredSelect,
  vouchDetailFailedSelect,
  vouchDetailPendingInviteSentSelect,
  vouchDetailPendingPayerSelect,
  vouchDetailRefundedSelect,
  vouchPaymentSummarySelect,
  vouchTimelineSelect,
  vouchWindowSummarySelect,
  whatHappensNextSelect,
} from "@/lib/db/selects/vouch.selects"
import { invitationTokenLookupSelect } from "@/lib/db/selects/invitation.selects"
import { participantSafeAuditTimelineItemSelect } from "@/lib/db/selects/audit.selects"

const DEFAULT_PAGE_SIZE = 20

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

function mapDates<T>(value: T): T {
  if (!value || typeof value !== "object") return value

  if (value instanceof Date) return iso(value) as T

  if (Array.isArray(value)) return value.map(mapDates) as T

  const out: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(value)) {
    out[key] = mapDates(child)
  }

  return out as T
}

function calculateFee(amountCents: number) {
  return calculatePlatformFeeCents({ amountCents })
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
  select: any = vouchDetailBaseSelect
): Promise<any> {
  noStore()

  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ payerId: user.id }, { payeeId: user.id }],
    },
    select,
  })

  return vouch ? mapDates(vouch) : null
}

async function readParticipantVouchByState(
  vouchId: string,
  variant: string,
  select: any = vouchDetailBaseSelect
) {
  const vouch = await requireParticipantVouch(vouchId, select)

  return {
    variant: vouch ? variant : "unauthorized_or_not_found",
    vouch,
  }
}

async function getInvitationByToken(token: string) {
  noStore()

  return prisma.invitation.findFirst({
    where: { tokenHash: await hashInvitationToken(token) },
    select: invitationTokenLookupSelect,
  })
}

function getConfirmationFacts(vouch: any, currentUserId?: string | null) {
  const confirmations = vouch?.presenceConfirmations ?? []
  const payerConfirmation = confirmations.find((c: any) => c.participantRole === "payer")
  const payeeConfirmation = confirmations.find((c: any) => c.participantRole === "payee")
  const currentUserConfirmation = currentUserId
    ? confirmations.find((c: any) => c.userId === currentUserId)
    : null

  return {
    payerConfirmed: payerConfirmation?.status === "confirmed",
    payeeConfirmed: payeeConfirmation?.status === "confirmed",
    bothConfirmed:
      payerConfirmation?.status === "confirmed" && payeeConfirmation?.status === "confirmed",
    currentUserConfirmed: currentUserConfirmation?.status === "confirmed",
    payerConfirmation,
    payeeConfirmation,
    currentUserConfirmation,
  }
}

function getWindowState(vouch: any) {
  const now = Date.now()
  const opensAt = vouch?.confirmationOpensAt ? new Date(vouch.confirmationOpensAt).getTime() : 0
  const expiresAt = vouch?.confirmationExpiresAt
    ? new Date(vouch.confirmationExpiresAt).getTime()
    : 0

  if (opensAt && now < opensAt) return "before_window"
  if (expiresAt && now > expiresAt) return "window_closed"
  return "window_open"
}

// Create flow

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
  const platformFeeCents = calculateFee(amountCents)

  return {
    amountCents,
    currency: input.currency ?? "usd",
    platformFeeCents,
      totalCents: amountCents + platformFeeCents,
    feeModel: {
      minimumFeeCents: DEFAULT_MINIMUM_PLATFORM_FEE_CENTS,
      basisPoints: Math.round(DEFAULT_PLATFORM_FEE_RATE * 10_000),
    },
  }
}

export async function getCreateVouchReviewState(input: {
  amountCents: number
  currency?: string
  meetingStartsAt?: string | Date | null
  confirmationOpensAt?: string | Date | null
  confirmationExpiresAt?: string | Date | null
  recipientEmail?: string | null
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
      currency: fee.currency,
      platformFeeCents: fee.platformFeeCents,
      totalCents: fee.totalCents,
      meetingStartsAt: input.meetingStartsAt ? new Date(input.meetingStartsAt).toISOString() : null,
      confirmationOpensAt: input.confirmationOpensAt
        ? new Date(input.confirmationOpensAt).toISOString()
        : null,
      confirmationExpiresAt: input.confirmationExpiresAt
        ? new Date(input.confirmationExpiresAt).toISOString()
        : null,
      recipientEmail: input.recipientEmail ?? null,
      label: input.label ?? null,
    },
  }
}

export async function getCreateVouchSuccessState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "created", vouchDetailPendingInviteSentSelect)
}

export async function getCreateVouchPaymentProcessingState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payment_processing", vouchPaymentSummarySelect)
}

export async function getCreateVouchPaymentFailedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payment_failed", vouchDetailFailedSelect)
}

// Invite / accept flow

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
    invitation: mapDates(invitation),
    signInHref: `/sign-in?return_to=${encodeURIComponent(`/vouches/invite/${token}`)}`,
    signUpHref: `/sign-up?return_to=${encodeURIComponent(`/vouches/invite/${token}`)}`,
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

  if (invitation.vouch.payerId === input.userId) {
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
    invitation: mapDates(invitation),
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
  const invitation = await getInvitationByToken(token)
  if (!invitation) return null

  return mapDates(invitation)
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

// Vouch list/detail

export async function listUserVouches(input?: {
  userId?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  const rows = await prisma.vouch.findMany({
    where: {
      OR: [{ payerId: userId }, { payeeId: userId }],
      ...(input?.status ? { status: input.status as any } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: vouchCardSelect,
  })

  return rows.map(mapDates)
}

export async function listPayerVouches(input?: {
  userId?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  const rows = await prisma.vouch.findMany({
    where: {
      payerId: userId,
      ...(input?.status ? { status: input.status as any } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: vouchCardSelect,
  })

  return rows.map(mapDates)
}

export async function listPayeeVouches(input?: {
  userId?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  const rows = await prisma.vouch.findMany({
    where: {
      payeeId: userId,
      ...(input?.status ? { status: input.status as any } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: vouchCardSelect,
  })

  return rows.map(mapDates)
}

export async function getVouchDetailForParticipant(input: { vouchId: string }) {
  const vouch = await requireParticipantVouch(input.vouchId, vouchDetailBaseSelect)

  if (!vouch) return getVouchDetailUnauthorizedOrNotFoundState(input.vouchId)

  return {
    variant: "detail",
    vouch,
  }
}

export async function getVouchDetailPendingPayerState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "pending_payer", vouchDetailPendingPayerSelect)
}

export async function getVouchDetailPendingInviteSentState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "pending_invite_sent",
    vouchDetailPendingInviteSentSelect
  )
}

export async function getVouchDetailActiveBeforeWindowState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "active_before_window",
    vouchDetailActiveBeforeWindowSelect
  )
}

export async function getVouchDetailActiveWindowOpenState(vouchId: string) {
  return readParticipantVouchByState(
    vouchId,
    "active_window_open",
    vouchDetailActiveWindowOpenSelect
  )
}

export async function getVouchDetailPayerConfirmedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payer_confirmed", vouchDetailActiveWindowOpenSelect)
}

export async function getVouchDetailPayeeConfirmedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "payee_confirmed", vouchDetailActiveWindowOpenSelect)
}

export async function getVouchDetailProcessingReleaseState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "processing_release", vouchPaymentSummarySelect)
}

export async function getVouchDetailCompletedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "completed", vouchDetailCompletedSelect)
}

export async function getVouchDetailExpiredState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "expired", vouchDetailExpiredSelect)
}

export async function getVouchDetailRefundedState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "refunded", vouchDetailRefundedSelect)
}

export async function getVouchDetailFailedPaymentState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "failed_payment", vouchDetailFailedSelect)
}

export async function getVouchDetailFailedReleaseState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "failed_release", vouchDetailFailedSelect)
}

export async function getVouchDetailFailedRefundState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "failed_refund", vouchDetailFailedSelect)
}

export async function getVouchDetailUnauthorizedOrNotFoundState(vouchId: string) {
  return {
    variant: "unauthorized_or_not_found",
    vouchId,
    title: "Vouch not found.",
  }
}

// Confirmation

export async function getConfirmPresencePageState(input: { vouchId: string }) {
  noStore()

  const user = await requireActiveUser()
  const vouch = await requireParticipantVouch(input.vouchId, vouchConfirmationStateSelect)

  if (!vouch) return getConfirmUnauthorizedState(input.vouchId)

  const facts = getConfirmationFacts(vouch, user.id)
  const windowState = getWindowState(vouch)

  if (windowState === "before_window") return getConfirmBeforeWindowState(input.vouchId)
  if (windowState === "window_closed") return getConfirmWindowClosedState(input.vouchId)
  if (facts.currentUserConfirmed) return getConfirmAlreadyConfirmedState(input.vouchId)
  if (facts.bothConfirmed) return getConfirmBothConfirmedSuccessState(input.vouchId)

  if (vouch.payerId === user.id) return getConfirmPresencePayerState(input.vouchId)
  if (vouch.payeeId === user.id) return getConfirmPresencePayeeState(input.vouchId)

  return getConfirmUnauthorizedState(input.vouchId)
}

export async function getConfirmPresencePayerState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "confirm_as_payer", vouchConfirmationStateSelect)
}

export async function getConfirmPresencePayeeState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "confirm_as_payee", vouchConfirmationStateSelect)
}

export async function getConfirmBeforeWindowState(vouchId: string) {
  return readParticipantVouchByState(vouchId, "before_window", vouchWindowSummarySelect)
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
  return readParticipantVouchByState(vouchId, "window_closed", vouchWindowSummarySelect)
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
  return readParticipantVouchByState(vouchId, "provider_failure", vouchDetailFailedSelect)
}

// Share

export async function getShareVouchState(vouchId: string) {
  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      payerId: user.id,
      status: "pending",
    },
    select: vouchDetailPendingInviteSentSelect,
  })

  return {
    variant: vouch ? "share" : "unavailable",
    vouch: mapDates(vouch),
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

// Timeline / summaries

export async function getVouchConfirmationState(vouchId: string) {
  const vouch = await requireParticipantVouch(vouchId, vouchConfirmationStateSelect)
  if (!vouch) return null

  return {
    vouch,
    facts: getConfirmationFacts(vouch),
    windowState: getWindowState(vouch),
  }
}

export async function getVouchWindowSummary(vouchId: string) {
  const vouch = await requireParticipantVouch(vouchId, vouchWindowSummarySelect)
  if (!vouch) return null

  return {
    vouch,
    windowState: getWindowState(vouch),
  }
}

export async function getVouchPaymentSummary(vouchId: string) {
  return requireParticipantVouch(vouchId, vouchPaymentSummarySelect)
}

export async function getVouchTimeline(vouchId: string) {
  return requireParticipantVouch(vouchId, vouchTimelineSelect)
}

export async function getParticipantSafeAuditTimeline(vouchId: string) {
  noStore()

  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ payerId: user.id }, { payeeId: user.id }],
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

  return rows.map(mapDates)
}

export async function getWhatHappensNextState(vouchId: string) {
  const vouch = await requireParticipantVouch(vouchId, whatHappensNextSelect)

  if (!vouch) {
    return {
      variant: "unauthorized_or_not_found",
      vouchId,
    }
  }

  const facts = getConfirmationFacts(vouch)
  const windowState = getWindowState(vouch)

  if (vouch.status === "pending") {
    return {
      variant: "waiting_for_acceptance",
      vouch,
      message: "The invited party must accept before confirmation can happen.",
    }
  }

  if (vouch.status === "active" && windowState === "before_window") {
    return {
      variant: "waiting_for_window",
      vouch,
      message: "Confirmation opens at the scheduled window.",
    }
  }

  if (vouch.status === "active" && windowState === "window_open" && !facts.bothConfirmed) {
    return {
      variant: "confirmation_required",
      vouch,
      message: "Both parties must confirm before the window closes.",
    }
  }

  if (vouch.status === "completed") {
    return {
      variant: "completed",
      vouch,
      message: "Both parties confirmed and funds were released.",
    }
  }

  if (vouch.status === "refunded" || vouch.status === "expired") {
    return {
      variant: "refund_or_non_capture",
      vouch,
      message: "Both confirmations were not completed in time, so funds did not release.",
    }
  }

  if (vouch.status === "failed") {
    return {
      variant: "technical_failure",
      vouch,
      message: "A technical payment or provider failure needs operational review.",
    }
  }

  return {
    variant: "status",
    vouch,
    message: "Review the current Vouch status.",
  }
}
