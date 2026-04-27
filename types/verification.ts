import type { UserID } from "./common"

export type VerificationStatus =
  | "unstarted"
  | "pending"
  | "verified"
  | "rejected"
  | "requires_action"
  | "expired"

export type VerificationKind = "identity" | "adult"

export interface VerificationStartInput {
  kind: VerificationKind
  returnTo?: string
}

export interface VerificationProviderReturnInput {
  provider: "stripe_identity"
  sessionId?: string
  returnTo?: string
}

export interface VerificationStatusUpdateInput {
  userId: UserID
  identityStatus?: VerificationStatus
  adultStatus?: VerificationStatus
  providerReference?: string
  failureCode?: string
}

export type VerificationPageVariant =
  | "start"
  | "pending"
  | "success"
  | "rejected"
  | "requires_action"
  | "failed"
