-- Align AuditEvent with prisma/schema.prisma.
-- The initial migration created "action"; the Prisma model expects "eventName".

ALTER TABLE "AuditEvent"
  RENAME COLUMN "action" TO "eventName";

DROP INDEX IF EXISTS "AuditEvent_action_createdAt_idx";

CREATE INDEX IF NOT EXISTS "AuditEvent_eventName_createdAt_idx"
  ON "AuditEvent"("eventName", "createdAt");
