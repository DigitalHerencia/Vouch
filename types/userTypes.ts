import type { UserID } from "./commonTypes"

export type UserStatus = "active" | "disabled" | "suspended"

export interface UserSafeIdentity {
  userId: UserID
  displayName?: string
  email?: string
}

export interface PrivateAccountInfo {
  userId: UserID
  email?: string
  phone?: string
  displayName?: string
  status: UserStatus
}

export interface ProfileBasicsInput {
  displayName?: string
  phone?: string
}

export interface UserStatusChangeInput {
  userId: UserID
  reason?: string
}

export type AccountPageVariant = "overview" | "private_info" | "disabled" | "loading" | "error"
