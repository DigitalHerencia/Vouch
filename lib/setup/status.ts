import type {
  PaymentReadinessStatus,
  PayoutReadinessStatus,
  SetupChecklistItem,
  SetupStatus,
  SetupBlockerCode,
  SetupGateResult,
  SetupGateState,
  SetupGateName,
  ConfirmationGateInput,
  UserStatus,
  VerificationStatus,
} from "@/types/setup"

export type BuildSetupStatusInput = {
  userStatus?: UserStatus
  identityStatus?: VerificationStatus
  adultStatus?: VerificationStatus
  paymentReadiness?: PaymentReadinessStatus
  payoutReadiness?: PayoutReadinessStatus
  accountActive?: boolean
  identityVerified?: boolean
  adultVerified?: boolean
  paymentReady?: boolean
  payoutReady?: boolean
  termsAccepted: boolean
}

export function buildSetupStatus(input: BuildSetupStatusInput): SetupStatus {
  const normalized = normalizeSetupInput(input)
  const activeUser = normalized.userStatus === "active"
  const identityVerified = normalized.identityStatus === "verified"
  const adultVerified = normalized.adultStatus === "verified"
  const paymentReady = normalized.paymentReadiness === "ready"
  const payoutReady = normalized.payoutReadiness === "ready"

  const checklist: SetupChecklistItem[] = [
    {
      key: "active_user",
      label: "Active account",
      status: activeUser ? "complete" : "blocked",
      reason: activeUser
        ? "Your account is active."
        : "Your account must be active before using Vouch.",
    },
    {
      key: "identity_verified",
      label: "Identity verification",
      status: statusFromVerification(normalized.identityStatus),
      reason: identityVerified
        ? "Identity verification is complete."
        : "Complete identity verification before payment-backed flows.",
      actionHref: "/settings/verification",
      actionLabel: "Verify identity",
    },
    {
      key: "adult_verified",
      label: "Adult eligibility",
      status: statusFromVerification(normalized.adultStatus),
      reason: adultVerified
        ? "Adult eligibility is confirmed."
        : "Adult eligibility is required for payment-backed flows.",
      actionHref: "/settings/verification",
      actionLabel: "Verify eligibility",
    },
    {
      key: "payment_ready",
      label: "Payment method",
      status: statusFromPaymentReadiness(normalized.paymentReadiness),
      reason: paymentReady
        ? "Payment setup is ready."
        : "Add a payment method before accepting Vouches.",
      actionHref: "/settings/payment",
      actionLabel: "Set up payment",
    },
    {
      key: "payout_ready",
      label: "Payout account",
      status: statusFromPayoutReadiness(normalized.payoutReadiness),
      reason: payoutReady
        ? "Payout setup is ready."
        : "Connect a payout account before creating Vouches.",
      actionHref: "/settings/payout",
      actionLabel: "Set up payout",
    },
    {
      key: "terms_accepted",
      label: "Terms accepted",
      status: input.termsAccepted ? "complete" : "not_started",
      reason: input.termsAccepted
        ? "Current terms have been accepted."
        : "Accept the current terms before payment-backed flows.",
      actionHref: "/setup",
      actionLabel: "Accept terms",
    },
  ]

  return {
    ...normalized,
    canCreateVouch:
      activeUser && identityVerified && adultVerified && payoutReady && input.termsAccepted,
    canAcceptVouch:
      activeUser && identityVerified && adultVerified && paymentReady && input.termsAccepted,
    checklist,
  }
}

export function getCreateReadiness(input: BuildSetupStatusInput): SetupGateResult {
  const normalized = normalizeSetupInput(input)
  return buildSetupGate("create_vouch", input, [
    ["account_inactive", normalized.userStatus !== "active"],
    ["identity_verification_required", normalized.identityStatus !== "verified"],
    ["adult_verification_required", normalized.adultStatus !== "verified"],
    ["payout_setup_required", normalized.payoutReadiness !== "ready"],
    ["terms_acceptance_required", !normalized.termsAccepted],
  ])
}

export function getAcceptReadiness(input: BuildSetupStatusInput): SetupGateResult {
  const normalized = normalizeSetupInput(input)
  return buildSetupGate("accept_vouch", input, [
    ["account_inactive", normalized.userStatus !== "active"],
    ["identity_verification_required", normalized.identityStatus !== "verified"],
    ["adult_verification_required", normalized.adultStatus !== "verified"],
    ["payment_method_required", normalized.paymentReadiness !== "ready"],
    ["terms_acceptance_required", !normalized.termsAccepted],
  ])
}

export function getSettingsReadiness(input: BuildSetupStatusInput): SetupGateResult {
  const normalized = normalizeSetupInput(input)
  return buildSetupGate("settings", input, [
    ["account_inactive", normalized.userStatus !== "active"],
  ])
}

export function getConfirmPresenceReadiness(input: ConfirmationGateInput): SetupGateResult {
  const now = input.now ?? new Date()
  const participant = input.currentUserId === input.payerId || input.currentUserId === input.payeeId

  const blockers: SetupBlockerCode[] = []
  if (input.userStatus !== "active") blockers.push("account_inactive")
  if (!participant) blockers.push("not_participant")
  if (input.vouchStatus !== "active") blockers.push("vouch_not_active")
  if (now.getTime() < input.confirmationOpensAt.getTime()) {
    blockers.push("confirmation_window_not_open")
  }
  if (now.getTime() > input.confirmationExpiresAt.getTime()) {
    blockers.push("confirmation_window_closed")
  }
  if (input.existingConfirmationUserIds.includes(input.currentUserId)) {
    blockers.push("duplicate_confirmation")
  }

  return {
    gate: "confirm_presence",
    ok: blockers.length === 0,
    blockers,
    status: blockers.length === 0 ? "complete" : "incomplete",
  }
}

export function getSetupBlockers(input: BuildSetupStatusInput): SetupBlockerCode[] {
  return Array.from(
    new Set([...getCreateReadiness(input).blockers, ...getAcceptReadiness(input).blockers])
  )
}

export function getReturnState(returnTo?: string): SetupGateState {
  if (!returnTo) return "incomplete"
  if (returnTo.startsWith("/vouches/invite/")) return "return_from_invite"
  if (returnTo === "/vouches/new" || returnTo.startsWith("/vouches/new?")) {
    return "return_from_create"
  }
  return "incomplete"
}

function buildSetupGate(
  gate: SetupGateName,
  input: BuildSetupStatusInput,
  checks: Array<[SetupBlockerCode, boolean]>
): SetupGateResult {
  const blockers = checks.filter(([, blocked]) => blocked).map(([code]) => code)

  return {
    gate,
    ok: blockers.length === 0,
    blockers,
    status: blockers.length === 0 ? "complete" : getBlockedState(input, blockers),
  }
}

function getBlockedState(
  input: BuildSetupStatusInput,
  blockers: SetupBlockerCode[]
): SetupGateState {
  const normalized = normalizeSetupInput(input)
  if (
    blockers.includes("identity_verification_required") ||
    blockers.includes("adult_verification_required")
  ) {
    return "blocked_by_verification"
  }
  if (blockers.includes("payment_method_required")) return "blocked_by_payment"
  if (blockers.includes("payout_setup_required")) return "blocked_by_payout"
  if (normalized.termsAccepted === false || normalized.userStatus !== "active") return "incomplete"
  return "incomplete"
}

function normalizeSetupInput(
  input: BuildSetupStatusInput
): Required<
  Pick<
    BuildSetupStatusInput,
    | "userStatus"
    | "identityStatus"
    | "adultStatus"
    | "paymentReadiness"
    | "payoutReadiness"
    | "termsAccepted"
  >
> {
  return {
    userStatus: input.userStatus ?? (input.accountActive === false ? "disabled" : "active"),
    identityStatus: input.identityStatus ?? (input.identityVerified ? "verified" : "unstarted"),
    adultStatus: input.adultStatus ?? (input.adultVerified ? "verified" : "unstarted"),
    paymentReadiness: input.paymentReadiness ?? (input.paymentReady ? "ready" : "not_started"),
    payoutReadiness: input.payoutReadiness ?? (input.payoutReady ? "ready" : "not_started"),
    termsAccepted: input.termsAccepted,
  }
}

function statusFromVerification(status: VerificationStatus): SetupChecklistItem["status"] {
  if (status === "verified") return "complete"
  if (status === "pending" || status === "requires_action") return "pending"
  if (status === "rejected" || status === "expired") return "blocked"
  return "not_started"
}

function statusFromPaymentReadiness(status: PaymentReadinessStatus): SetupChecklistItem["status"] {
  if (status === "ready") return "complete"
  if (status === "requires_action") return "pending"
  if (status === "failed") return "blocked"
  return "not_started"
}

function statusFromPayoutReadiness(status: PayoutReadinessStatus): SetupChecklistItem["status"] {
  if (status === "ready") return "complete"
  if (status === "requires_action") return "pending"
  if (status === "restricted" || status === "failed") return "blocked"
  return "not_started"
}
