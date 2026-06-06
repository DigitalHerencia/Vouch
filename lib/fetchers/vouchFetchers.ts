import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { mapAuditTimelineDTO, type AuditTimelineItemDTO } from "@/lib/dto/audit.mappers"
import {
  mapVouchConfirmationStateDTO,
  mapVouchDetailDTO,
  mapVouchWindowSummaryDTO,
  type VouchDetailDTO,
} from "@/lib/dto/vouch.mappers"
import { prisma } from "@/lib/db/prisma"
import { auditTimelineItemSelect } from "@/lib/db/selects/audit.selects"
import {
  vouchConfirmationStateSelect,
  vouchDetailBaseSelect,
  vouchWindowSummarySelect,
} from "@/lib/db/selects/vouch.selects"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getCreateVouchReadinessGate } from "@/lib/fetchers/readinessFetchers"
import { deriveConfirmationCode } from "@/lib/vouch/confirmation-codes"

type VouchDetailRecord = Prisma.VouchGetPayload<{ select: typeof vouchDetailBaseSelect }>
type VouchConfirmationRecord = Prisma.VouchGetPayload<{
  select: typeof vouchConfirmationStateSelect
}>
type VouchWindowRecord = Prisma.VouchGetPayload<{ select: typeof vouchWindowSummarySelect }>

async function requireParticipantVouch<TSelect extends Prisma.VouchSelect>(
  vouchId: string,
  select: TSelect
): Promise<Prisma.VouchGetPayload<{ select: TSelect }> | null> {
  noStore()

  const user = await requireActiveUser()

  return prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ merchantId: user.id }, { customerId: user.id }],
    },
    select,
  }) as Promise<Prisma.VouchGetPayload<{ select: TSelect }> | null>
}

export async function getCreateVouchPageState(input?: { userId?: string }) {
  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id
  const gate = await getCreateVouchReadinessGate(userId)

  return {
    variant: gate.allowed ? "ready" : "blocked",
    userId,
    gate,
  }
}

export async function getVouchDetailForParticipant(input: {
  vouchId: string
}): Promise<
  | { variant: string; vouch: VouchDetailDTO | null }
  | { variant: string; vouchId: string; title: string }
> {
  const vouch = await requireParticipantVouch(input.vouchId, vouchDetailBaseSelect)

  if (!vouch) return getVouchDetailUnauthorizedOrNotFoundState(input.vouchId)

  return {
    variant: "detail",
    vouch: mapVouchDetailDTO(vouch as VouchDetailRecord),
  }
}

export async function getVouchDetailPageState(input: { vouchId: string }) {
  noStore()

  const user = await requireActiveUser()
  const vouch = await prisma.vouch.findFirst({
    where: {
      id: input.vouchId,
      OR: [{ merchantId: user.id }, { customerId: user.id }],
    },
    select: vouchDetailBaseSelect,
  })
  if (!vouch) return null

  const timeline = await prisma.auditEvent.findMany({
    where: { entityType: "Vouch", entityId: input.vouchId },
    orderBy: { createdAt: "asc" },
    select: auditTimelineItemSelect,
  })
  const detail = mapVouchDetailDTO(vouch as VouchDetailRecord)
  const confirmation = mapVouchConfirmationStateDTO(vouch as VouchConfirmationRecord)
  const currentUserConfirmed =
    (vouch.merchantId === user.id && confirmation.merchantConfirmed) ||
    (vouch.customerId === user.id && confirmation.customerConfirmed)
  const role =
    vouch.merchantId === user.id ? "merchant" : vouch.customerId === user.id ? "customer" : null
  const canConfirm = role !== null && confirmation.windowState === "open" && !currentUserConfirmed

  return {
    userId: user.id,
    vouch: detail,
    canConfirm,
    role,
    currentUserCode:
      canConfirm && role
        ? deriveConfirmationCode({
            vouchId: vouch.id,
            publicId: vouch.publicId,
            participantRole: role,
            participantUserId: user.id,
          })
        : undefined,
    timeline: mapAuditTimelineDTO(timeline),
  }
}

function getVouchDetailUnauthorizedOrNotFoundState(vouchId: string) {
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
  const currentUserConfirmed =
    (vouch.merchantId === user.id && dto.merchantConfirmed) ||
    (vouch.customerId === user.id && dto.customerConfirmed)

  if (dto.windowState === "before_window") return getConfirmBeforeWindowState(input.vouchId)
  if (dto.windowState === "closed") return getConfirmWindowClosedState(input.vouchId)
  if (currentUserConfirmed) return getConfirmAlreadyConfirmedState(input.vouchId)
  if (dto.aggregateConfirmationStatus === "both_confirmed") {
    return getConfirmBothConfirmedSuccessState(input.vouchId)
  }

  if (vouch.merchantId === user.id) {
    return {
      variant: "confirm_as_merchant",
      vouch: dto,
      currentUserCode: deriveConfirmationCode({
        vouchId: vouch.id,
        publicId: vouch.publicId,
        participantRole: "merchant",
        participantUserId: user.id,
      }),
    }
  }

  if (vouch.customerId === user.id) {
    return {
      variant: "confirm_as_customer",
      vouch: dto,
      currentUserCode: deriveConfirmationCode({
        vouchId: vouch.id,
        publicId: vouch.publicId,
        participantRole: "customer",
        participantUserId: user.id,
      }),
    }
  }

  return getConfirmUnauthorizedState(input.vouchId)
}

function getConfirmBeforeWindowState(vouchId: string) {
  return getConfirmWindowState(vouchId, "before_window")
}

function getConfirmWindowClosedState(vouchId: string) {
  return getConfirmWindowState(vouchId, "window_closed")
}

async function getConfirmWindowState(vouchId: string, variant: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchWindowSummarySelect
  )) as VouchWindowRecord | null

  return {
    variant: vouch ? variant : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchWindowSummaryDTO(vouch) : null,
  }
}

async function getConfirmAlreadyConfirmedState(vouchId: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchConfirmationStateSelect
  )) as VouchConfirmationRecord | null

  return {
    variant: vouch ? "already_confirmed" : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchConfirmationStateDTO(vouch) : null,
  }
}

async function getConfirmBothConfirmedSuccessState(vouchId: string) {
  const vouch = (await requireParticipantVouch(
    vouchId,
    vouchConfirmationStateSelect
  )) as VouchConfirmationRecord | null

  return {
    variant: vouch ? "both_confirmed" : "unauthorized_or_not_found",
    vouch: vouch ? mapVouchConfirmationStateDTO(vouch) : null,
  }
}

function getConfirmUnauthorizedState(vouchId: string) {
  return {
    variant: "unauthorized",
    vouchId,
    title: "You cannot confirm this Vouch.",
  }
}

export async function getAuditTimeline(vouchId: string): Promise<AuditTimelineItemDTO[]> {
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
    },
    orderBy: { createdAt: "asc" },
    select: auditTimelineItemSelect,
  })

  return mapAuditTimelineDTO(rows)
}

export async function getVouchParticipantActionState(vouchId: string) {
  return requireParticipantVouch(vouchId, {
    id: true,
    publicId: true,
    merchantId: true,
    customerId: true,
  })
}
