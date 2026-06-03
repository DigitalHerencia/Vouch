import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const auditTimelineItemSelect = {
  id: true,
  eventName: true,
  actorType: true,
  entityType: true,
  entityId: true,
  metadata: true,
  createdAt: true,
} as const satisfies Prisma.AuditEventSelect
