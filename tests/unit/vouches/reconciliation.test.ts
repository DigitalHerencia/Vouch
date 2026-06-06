import { beforeEach, describe, expect, it, vi } from "vitest"

const findVouches = vi.fn()
const findRetries = vi.fn()
const claimRetry = vi.fn()
const updateRetry = vi.fn()
const findPayment = vi.fn()
const transaction = vi.fn()
const captureStripePayment = vi.fn()

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    vouch: { findMany: findVouches },
    operationalRetry: {
      findMany: findRetries,
      updateMany: claimRetry,
      update: updateRetry,
    },
    paymentIntentRecord: { findFirst: findPayment },
    $transaction: transaction,
  },
}))

vi.mock("@/lib/integrations/stripe/payment-intents", () => ({
  captureStripePayment,
  cancelStripeAuthorization: vi.fn(),
}))

const now = new Date("2026-06-06T12:00:00.000Z")
const retry = {
  id: "retry_1",
  vouchId: "vouch_1",
  entityId: "payment_1",
  attemptCount: 0,
  vouch: {
    presenceConfirmation: {
      windowOpensAt: new Date("2026-06-06T10:00:00.000Z"),
      windowClosesAt: new Date("2026-06-06T12:00:00.000Z"),
      merchantConfirmedAt: new Date("2026-06-06T10:30:00.000Z"),
      customerConfirmedAt: new Date("2026-06-06T11:00:00.000Z"),
    },
  },
}

describe("Vouch reconciliation recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findVouches.mockResolvedValue([])
    findRetries.mockResolvedValue([retry])
    findPayment.mockResolvedValue({
      stripePaymentIntentId: "pi_1",
      stripeAccountId: "acct_1",
    })
    transaction.mockResolvedValue(undefined)
  })

  it("captures only after atomically claiming the retry", async () => {
    claimRetry.mockResolvedValue({ count: 0 })

    const { reconcileVouchDeadlines } = await import("@/lib/vouch/reconciliation")
    const result = await reconcileVouchDeadlines(now)

    expect(claimRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: retry.id,
          status: { in: ["pending", "failed"] },
        }),
        data: { status: "processing", lockedAt: now },
      })
    )
    expect(findPayment).not.toHaveBeenCalled()
    expect(captureStripePayment).not.toHaveBeenCalled()
    expect(result.capturesRetried).toBe(0)
  })

  it("releases a claimed retry after capture failure", async () => {
    claimRetry.mockResolvedValue({ count: 1 })
    captureStripePayment.mockRejectedValue(new Error("provider unavailable"))

    const { reconcileVouchDeadlines } = await import("@/lib/vouch/reconciliation")
    await reconcileVouchDeadlines(now)

    expect(updateRetry).toHaveBeenCalledWith({
      where: { id: retry.id },
      data: {
        status: "pending",
        attemptCount: { increment: 1 },
        lastAttemptAt: now,
        nextAttemptAt: new Date("2026-06-06T12:05:00.000Z"),
        failureReason: "provider unavailable",
        lockedAt: null,
      },
    })
  })
})
