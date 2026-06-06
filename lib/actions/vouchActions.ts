"use server"

import {
  archiveVouch as archiveVouchWorkflow,
  calculatePlatformFee as calculatePlatformFeeWorkflow,
  claimCustomerAuthorizationCheckout as claimCustomerAuthorizationCheckoutWorkflow,
  confirmPresence as confirmPresenceWorkflow,
  confirmPresenceFormAction as confirmPresenceFormWorkflow,
  createVouch as createVouchWorkflow,
  getCustomerAuthorizationCheckoutForAuthenticatedUser as getCustomerAuthorizationCheckoutForAuthenticatedUserWorkflow,
  getCreateVouchFormReadiness as getCreateVouchFormReadinessWorkflow,
  validateCreateVouchDraft as validateCreateVouchDraftWorkflow,
} from "@/lib/vouch/workflows"

export async function calculatePlatformFee(input: unknown) {
  return calculatePlatformFeeWorkflow(input)
}

export async function validateCreateVouchDraft(input: unknown) {
  return validateCreateVouchDraftWorkflow(input)
}

export async function getCreateVouchFormReadiness(input?: { syncStripeConnectReturn?: boolean }) {
  return getCreateVouchFormReadinessWorkflow(input)
}

export async function createVouch(input: unknown) {
  return createVouchWorkflow(input)
}

export async function claimCustomerAuthorizationCheckout(input: {
  checkoutSessionId: string
  revalidate?: boolean
}) {
  return claimCustomerAuthorizationCheckoutWorkflow(input)
}

export async function getCustomerAuthorizationCheckoutForAuthenticatedUser(input: {
  publicId: string
}) {
  return getCustomerAuthorizationCheckoutForAuthenticatedUserWorkflow(input)
}

export async function confirmPresence(input: unknown) {
  return confirmPresenceWorkflow(input)
}

export async function confirmPresenceFormAction(formData: FormData): Promise<void> {
  await confirmPresenceFormWorkflow(formData)
}

export async function archiveVouch(input: unknown) {
  return archiveVouchWorkflow(input)
}
