import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const participantSafeAuditTimelineItemSelect = {
  id: true,
  eventName: true,
  actorType: true,
  entityType: true,
  entityId: true,
  participantSafe: true,
  createdAt: true,
} as const satisfies Prisma.AuditEventSelect

export const participantSafeAuditTimelineSelect = participantSafeAuditTimelineItemSelect

export const adminAuditListItemSelect = {
  id: true,
  eventName: true,
  actorType: true,
  actorUserId: true,
  entityType: true,
  entityId: true,
  requestId: true,
  participantSafe: true,
  createdAt: true,
} as const satisfies Prisma.AuditEventSelect

export const adminAuditEventDetailSelect = {
  ...adminAuditListItemSelect,
  metadata: true,
  actorUser: {
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
    },
  },
} as const satisfies Prisma.AuditEventSelect

export const vouchAuditSummarySelect = participantSafeAuditTimelineItemSelect
export const paymentAuditSummarySelect = participantSafeAuditTimelineItemSelect
export const userAuditSummarySelect = adminAuditListItemSelect
