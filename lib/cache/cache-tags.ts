export const CACHE_TAGS = {
  vouches: "vouches",
  payments: "payments",
  dashboard: "dashboard",
  notifications: "notifications",
  adminVouches: "admin:vouches",
  adminUsers: "admin:users",
  adminPayments: "admin:payments",
  adminWebhooks: "admin:webhooks",
  adminAudit: "admin:audit",
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

export function notificationTag(notificationEventId: string) {
  return `notification:${notificationEventId}`
}

export function userNotificationsTag(userId: string) {
  return `user:${userId}:notifications`
}
