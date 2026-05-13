import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/fetchers/authFetchers", () => ({
  requireActiveUser: vi.fn().mockResolvedValue({ id: "user_1", status: "active" }),
}))

vi.mock("@/lib/fetchers/setupFetchers", () => ({
  assertCreateVouchReadinessReady: vi.fn(),
  assertAcceptVouchReadinessReady: vi.fn(),
}))

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/actions/paymentActions", () => ({
  initializeStripeCheckoutSessionForVouch: vi.fn(),
  initializeStripePaymentForVouch: vi.fn(),
  refundOrVoidStripePaymentForVouch: vi.fn(),
  releaseStripePaymentForCompletedVouch: vi.fn(),
}))

vi.mock("@/lib/actions/transactions/vouchTransactions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/transactions/vouchTransactions")>()
  return {
    ...actual,
    bindPayeeToVouchTx: vi.fn(),
  }
})

vi.mock("@/lib/actions/transactions/invitationTransactions", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/db/transactions/invitationTransactions")>()
  return {
    ...actual,
    markInvitationAcceptedTx: vi.fn(),
  }
})

vi.mock("@/lib/actions/transactions/notificationTransactions", () => ({
  queueNotificationTx: vi.fn(),
}))

describe("vouch actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an ActionResult when create setup is blocked", async () => {
    const { assertCreateVouchReadinessReady } = await import("@/lib/fetchers/setupFetchers")
    const { createVouch } = await import("@/lib/actions/vouchActions")

    vi.mocked(assertCreateVouchReadinessReady).mockRejectedValueOnce(
      new Error("READINESS_BLOCKED: payment_ready")
    )

    const result = await createVouch({
      amountCents: 10_000,
      currency: "usd",
      appointmentStartsAt: new Date("2026-05-01T16:00:00.000Z"),
      confirmationOpensAt: new Date("2026-05-01T16:00:00.000Z"),
      confirmationExpiresAt: new Date("2026-05-01T17:00:00.000Z"),
      disclaimerAccepted: true,
    })

    expect(result).toEqual({
      ok: false,
      code: "READINESS_BLOCKED",
      formError: "Required account readiness is incomplete.",
    })
  })

  it("returns an ActionResult when accept setup is blocked", async () => {
    const { assertAcceptVouchReadinessReady } = await import("@/lib/fetchers/setupFetchers")
    const { acceptVouch } = await import("@/lib/actions/vouchActions")

    vi.mocked(assertAcceptVouchReadinessReady).mockRejectedValueOnce(
      new Error("READINESS_BLOCKED: payout_ready")
    )

    const result = await acceptVouch({ token: "valid-token", disclaimerAccepted: true })

    expect(result).toEqual({
      ok: false,
      code: "READINESS_BLOCKED",
      formError: "Required account readiness is incomplete.",
    })
  })
})
