import type {
    PaymentReadinessStatus,
    PayoutReadinessStatus,
    SetupChecklistItem,
    SetupStatus,
    UserStatus,
    VerificationStatus,
} from "@/types/setup.types"

export type BuildSetupStatusInput = {
    userStatus: UserStatus
    identityStatus: VerificationStatus
    adultStatus: VerificationStatus
    paymentReadiness: PaymentReadinessStatus
    payoutReadiness: PayoutReadinessStatus
    termsAccepted: boolean
}

export function buildSetupStatus(input: BuildSetupStatusInput): SetupStatus {
    const activeUser = input.userStatus === "active"
    const identityVerified = input.identityStatus === "verified"
    const adultVerified = input.adultStatus === "verified"
    const paymentReady = input.paymentReadiness === "ready"
    const payoutReady = input.payoutReadiness === "ready"

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
            status: statusFromVerification(input.identityStatus),
            reason: identityVerified
                ? "Identity verification is complete."
                : "Complete identity verification before payment-backed flows.",
            actionHref: "/settings/verification",
            actionLabel: "Verify identity",
        },
        {
            key: "adult_verified",
            label: "Adult eligibility",
            status: statusFromVerification(input.adultStatus),
            reason: adultVerified
                ? "Adult eligibility is confirmed."
                : "Adult eligibility is required for payment-backed flows.",
            actionHref: "/settings/verification",
            actionLabel: "Verify eligibility",
        },
        {
            key: "payment_ready",
            label: "Payment method",
            status: statusFromPaymentReadiness(input.paymentReadiness),
            reason: paymentReady
                ? "Payment setup is ready."
                : "Add a payment method before creating Vouches.",
            actionHref: "/settings/payment",
            actionLabel: "Set up payment",
        },
        {
            key: "payout_ready",
            label: "Payout account",
            status: statusFromPayoutReadiness(input.payoutReadiness),
            reason: payoutReady
                ? "Payout setup is ready."
                : "Connect a payout account before accepting Vouches.",
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
        ...input,
        canCreateVouch:
            activeUser &&
            identityVerified &&
            adultVerified &&
            paymentReady &&
            input.termsAccepted,
        canAcceptVouch:
            activeUser &&
            identityVerified &&
            adultVerified &&
            payoutReady &&
            input.termsAccepted,
        checklist,
    }
}

function statusFromVerification(status: VerificationStatus): SetupChecklistItem["status"] {
    if (status === "verified") return "complete"
    if (status === "pending" || status === "requires_action") return "pending"
    if (status === "rejected" || status === "expired") return "blocked"
    return "not_started"
}

function statusFromPaymentReadiness(
    status: PaymentReadinessStatus,
): SetupChecklistItem["status"] {
    if (status === "ready") return "complete"
    if (status === "requires_action") return "pending"
    if (status === "failed") return "blocked"
    return "not_started"
}

function statusFromPayoutReadiness(
    status: PayoutReadinessStatus,
): SetupChecklistItem["status"] {
    if (status === "ready") return "complete"
    if (status === "requires_action") return "pending"
    if (status === "restricted" || status === "failed") return "blocked"
    return "not_started"
}
