import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const participantSafeAuditTimelineItemSelect = {
  id: true,
  eventName: true,
  actorType: true,
  entityType: true,
  entityId: true,
  participantSafe: true,
  metadata: true,
  createdAt: true,
} as const satisfies Prisma.AuditEventSelect
