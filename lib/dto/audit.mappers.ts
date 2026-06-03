import "server-only"

import type { ISODateTime } from "@/types/commonTypes"

type DateLike = Date | string | null | undefined

export type AuditTimelineItemDTO = {
  id: string
  eventName: string
  actorType: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: ISODateTime
}

type AuditTimelineItemRecord = {
  id: string
  eventName: string
  actorType: string
  entityType: string
  entityId: string
  metadata: unknown
  createdAt: DateLike
}

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

const unsafeMetadataKeyPattern = /clerk|stripe|webhook|token|identity|card|bank|payload|signature/i

function toAuditTimelineMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  return Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => {
      if (unsafeMetadataKeyPattern.test(key)) return false
      if (entry === null) return true

      return ["boolean", "number", "string"].includes(typeof entry)
    })
  )
}

export function mapAuditTimelineItemDTO(record: AuditTimelineItemRecord): AuditTimelineItemDTO {
  return {
    id: record.id,
    eventName: record.eventName,
    actorType: record.actorType,
    entityType: record.entityType,
    entityId: record.entityId,
    metadata: toAuditTimelineMetadata(record.metadata),
    createdAt: toIso(record.createdAt) ?? "",
  }
}

export function mapAuditTimelineDTO(records: AuditTimelineItemRecord[]): AuditTimelineItemDTO[] {
  return records.map(mapAuditTimelineItemDTO)
}
