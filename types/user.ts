import type { z } from "zod"
import type {
  accountPageVariantSchema,
  privateAccountInfoSchema,
  profileBasicsInputSchema,
  userSafeIdentitySchema,
  userStatusChangeInputSchema,
  userStatusSchema,
} from "@/schemas/user"

export type UserStatus = z.infer<typeof userStatusSchema>
export type UserSafeIdentity = z.infer<typeof userSafeIdentitySchema>
export type PrivateAccountInfo = z.infer<typeof privateAccountInfoSchema>
export type ProfileBasicsInput = z.infer<typeof profileBasicsInputSchema>
export type UserStatusChangeInput = z.infer<typeof userStatusChangeInputSchema>
export type AccountPageVariant = z.infer<typeof accountPageVariantSchema>