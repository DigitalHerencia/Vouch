import "server-only"

import { unstable_noStore as noStore } from "next/cache"
import type { ParticipantRole } from "@/types/vouchTypes"
import type { Prisma } from "@/prisma/generated/prisma/client"

import { mapAuditTimelineDTO } from "@/lib/db/dto/audit.mappers"
import { mapVouchConfirmationStateDTO, mapVouchDetailDTO } from "@/lib/db/dto/vouch.mappers"
import { prisma } from "@/lib/db/prisma"
import { auditTimelineItemSelect } from "@/lib/db/selects/audit.selects"
import { vouchConfirmationStateSelect, vouchDetailBaseSelect } from "@/lib/db/selects/vouch.selects"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { deriveConfirmationCode } from "@/lib/vouch/confirmation-codes"

type VouchDetailRecord = Prisma.VouchGetPayload<{ select: typeof vouchDetailBaseSelect }>
type VouchConfirmationRecord = Prisma.VouchGetPayload<{
  select: typeof vouchConfirmationStateSelect
}>

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

  const role: ParticipantRole | null =
    vouch.merchantId === user.id ? "merchant" : vouch.customerId === user.id ? "customer" : null

  const canConfirm = role !== null && confirmation.windowState === "open" && !currentUserConfirmed

  const canShowCurrentUserCode = role !== null && confirmation.windowState === "open"

  return {
    userId: user.id,
    vouch: detail,
    canConfirm,
    role,
    currentUserCode:
      canShowCurrentUserCode && role
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

export async function getVouchParticipantActionState(vouchId: string) {
  return requireParticipantVouch(vouchId, {
    id: true,
    publicId: true,
    merchantId: true,
    customerId: true,
  })
}
