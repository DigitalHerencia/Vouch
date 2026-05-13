import "server-only"

import type { ISODateTime } from "@/types/common"

type DateLike = Date | string | null | undefined

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

export type ParticipantSafeAuditTimelineItemDTO = {
  id: string
  eventName: string
  actorType: string
  entityType: string
  entityId: string
  participantSafe: boolean
  metadata: unknown
  createdAt: ISODateTime
}

type ParticipantSafeAuditTimelineItemRecord = {
  id: string
  eventName: string
  actorType: string
  entityType: string
  entityId: string
  participantSafe: boolean
  metadata: unknown
  createdAt: Date | string
}

export function mapParticipantSafeAuditTimelineItemDTO(
  record: ParticipantSafeAuditTimelineItemRecord
): ParticipantSafeAuditTimelineItemDTO {
  return {
    id: record.id,
    eventName: record.eventName,
    actorType: record.actorType,
    entityType: record.entityType,
    entityId: record.entityId,
    participantSafe: record.participantSafe,
    metadata: record.metadata,
    createdAt: toIso(record.createdAt) ?? "",
  }
}

export function mapParticipantSafeAuditTimelineDTO(
  records: ParticipantSafeAuditTimelineItemRecord[]
): ParticipantSafeAuditTimelineItemDTO[] {
  return records.map(mapParticipantSafeAuditTimelineItemDTO)
}
