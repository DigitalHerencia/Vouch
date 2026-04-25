import type { z } from "zod"
import type {
  authEntryContextSchema,
  authPageVariantSchema,
  authRedirectContextSchema,
  authzSnapshotSchema,
  baseRoleSchema,
  clerkUserSyncSchema,
  contextualRoleSchema,
  sessionUserSchema,
} from "@/schemas/auth"

export type BaseRole = z.infer<typeof baseRoleSchema>
export type ContextualRole = z.infer<typeof contextualRoleSchema>
export type AuthEntryContext = z.infer<typeof authEntryContextSchema>
export type AuthPageVariant = z.infer<typeof authPageVariantSchema>
export type AuthRedirectContext = z.infer<typeof authRedirectContextSchema>
export type SessionUser = z.infer<typeof sessionUserSchema>
export type AuthzSnapshot = z.infer<typeof authzSnapshotSchema>
export type ClerkUserSyncInput = z.infer<typeof clerkUserSyncSchema>