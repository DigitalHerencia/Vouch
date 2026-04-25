import type { z } from "zod"
import type {
  auditActorTypeSchema,
  auditEntityTypeSchema,
  auditEventNameSchema,
  auditFilterInputSchema,
  writeAuditEventInputSchema,
} from "@/schemas/audit"

export type AuditActorType = z.infer<typeof auditActorTypeSchema>
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>
export type AuditEventName = z.infer<typeof auditEventNameSchema>
export type WriteAuditEventInput = z.infer<typeof writeAuditEventInputSchema>
export type AuditFilterInput = z.infer<typeof auditFilterInputSchema>