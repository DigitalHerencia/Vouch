export const CACHE_TAGS = {
  vouches: "vouches",
  payments: "payments",
  adminVouches: "admin:vouches",
} as const

export function vouchTag(vouchId: string) {
  return `vouch:${vouchId}`
}

export function userVouchesTag(userId: string) {
  return `user:${userId}:vouches`
}

export function paymentTag(paymentId: string) {
  return `payment:${paymentId}`
}

export function verificationTag(userId: string) {
  return `verification:${userId}`
}

export function vouchAuditTag(vouchId: string) {
  return `audit:vouch:${vouchId}`
}
