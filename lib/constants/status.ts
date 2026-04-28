export const FINAL_VOUCH_STATUSES = [
  "completed",
  "expired",
  "refunded",
  "canceled",
  "failed",
] as const
export const ACTIVE_VOUCH_STATUSES = ["pending", "active"] as const
export const PARTICIPANT_ROLES = ["payer", "payee"] as const
