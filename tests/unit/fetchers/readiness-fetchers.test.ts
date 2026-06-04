import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}))

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}))

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}))

vi.mock("@/lib/fetchers/authFetchers", () => ({
  requireActiveUser: vi.fn().mockResolvedValue({ id: "user_1", status: "active" }),
}))

function readinessRecord(input: {
  paymentMethodReady?: "not_started" | "requires_action" | "ready"
  payoutReadiness?: "not_started" | "requires_action" | "ready"
  stripeAccountId?: string | null
}) {
  const merchantReady = input.payoutReadiness === "ready"

  return {
    id: "user_1",
    status: "active",
    paymentCustomer: {
      paymentMethodReady: input.paymentMethodReady === "ready",
    },
    connectedAccount: {
      stripeAccountId: input.stripeAccountId === null ? null : "acct_123",
      chargesEnabled: merchantReady,
      detailsSubmitted: merchantReady,
      payoutsEnabled: merchantReady,
    },
  }
}

function queueReadiness(record: ReturnType<typeof readinessRecord>) {
  prismaMock.user.findUnique.mockResolvedValueOnce(record)
}

describe("readiness capability gates", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("blocks Vouch creation without a connected Stripe merchant account", async () => {
    const { getCreateVouchReadinessGate } = await import("@/lib/fetchers/readinessFetchers")

    queueReadiness(
      readinessRecord({
        paymentMethodReady: "not_started",
        payoutReadiness: "ready",
        stripeAccountId: null,
      })
    )

    await expect(getCreateVouchReadinessGate("user_1")).resolves.toMatchObject({
      allowed: false,
      blockers: ["payout_method_required"],
    })
  })

  it("allows Vouch creation for a merchant-capable user without requiring customer payment readiness", async () => {
    const { getCreateVouchReadinessGate } = await import("@/lib/fetchers/readinessFetchers")

    queueReadiness(
      readinessRecord({
        paymentMethodReady: "not_started",
        payoutReadiness: "ready",
      })
    )

    await expect(getCreateVouchReadinessGate("user_1")).resolves.toMatchObject({
      allowed: true,
      blockers: [],
    })
  })

  it("blocks Vouch acceptance until the accepting user is customer-capable", async () => {
    const { getAcceptVouchReadinessGate } = await import("@/lib/fetchers/readinessFetchers")

    queueReadiness(
      readinessRecord({
        paymentMethodReady: "not_started",
        payoutReadiness: "ready",
      })
    )

    await expect(getAcceptVouchReadinessGate({ userId: "user_1" })).resolves.toMatchObject({
      allowed: false,
      blockers: ["payment_method_required"],
    })
  })

  it("allows Vouch acceptance for a customer-capable user without requiring merchant payout readiness", async () => {
    const { getAcceptVouchReadinessGate } = await import("@/lib/fetchers/readinessFetchers")

    queueReadiness(
      readinessRecord({
        paymentMethodReady: "ready",
        payoutReadiness: "not_started",
      })
    )

    await expect(getAcceptVouchReadinessGate({ userId: "user_1" })).resolves.toMatchObject({
      allowed: true,
      blockers: [],
    })
  })
})
