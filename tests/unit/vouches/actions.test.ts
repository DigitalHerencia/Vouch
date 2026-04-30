import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/fetchers/authFetchers", () => ({
  requireActiveUser: vi.fn().mockResolvedValue({ id: "user_1", status: "active" }),
}))

vi.mock("@/lib/fetchers/setupFetchers", () => ({
  assertCreateVouchSetupReady: vi.fn(),
  assertAcceptVouchSetupReady: vi.fn(),
}))

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/actions/stripePaymentActions", () => ({
  initializeStripePaymentForVouch: vi.fn(),
  refundOrVoidStripePaymentForVouch: vi.fn(),
  releaseStripePaymentForCompletedVouch: vi.fn(),
}))

vi.mock("@/lib/actions/transactions/vouchTransactions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/actions/transactions/vouchTransactions")>()
  return {
    ...actual,
    bindPayeeToVouchTx: vi.fn(),
  }
})

vi.mock("@/lib/actions/transactions/invitationTransactions", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/actions/transactions/invitationTransactions")>()
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
    const { assertCreateVouchSetupReady } = await import("@/lib/fetchers/setupFetchers")
    const { createVouch } = await import("@/lib/actions/vouchActions")

    vi.mocked(assertCreateVouchSetupReady).mockRejectedValueOnce(
      new Error("SETUP_BLOCKED: payment_ready")
    )

    const result = await createVouch({
      amountCents: 10_000,
      currency: "usd",
      meetingStartsAt: new Date("2026-05-01T16:00:00.000Z"),
      confirmationOpensAt: new Date("2026-05-01T16:00:00.000Z"),
      confirmationExpiresAt: new Date("2026-05-01T17:00:00.000Z"),
    })

    expect(result).toEqual({
      ok: false,
      code: "SETUP_BLOCKED",
      formError: "Finish setup before continuing.",
    })
  })

  it("returns an ActionResult when accept setup is blocked", async () => {
    const { assertAcceptVouchSetupReady } = await import("@/lib/fetchers/setupFetchers")
    const { acceptVouch } = await import("@/lib/actions/vouchActions")

    vi.mocked(assertAcceptVouchSetupReady).mockRejectedValueOnce(
      new Error("SETUP_BLOCKED: payout_ready")
    )

    const result = await acceptVouch({ token: "valid-token" })

    expect(result).toEqual({
      ok: false,
      code: "SETUP_BLOCKED",
      formError: "Finish setup before continuing.",
    })
  })
})
