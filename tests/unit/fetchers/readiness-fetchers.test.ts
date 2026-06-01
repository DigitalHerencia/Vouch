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
  identityStatus?: "unstarted" | "pending" | "verified" | "rejected" | "requires_action" | "expired"
  adultStatus?: "unstarted" | "pending" | "verified" | "rejected" | "requires_action" | "expired"
  paymentMethodReady?: "not_started" | "requires_action" | "ready"
  payoutReadiness?: "not_started" | "requires_action" | "ready"
  termsAccepted?: boolean
}) {
  return {
    id: "user_1",
    status: "active",
    verificationProfile: {
      identityStatus: input.identityStatus ?? "verified",
      adultStatus: input.adultStatus ?? "verified",
    },
    paymentCustomer: {
      readiness: input.paymentMethodReady ?? "not_started",
    },
    connectedAccount: {
      readiness: input.payoutReadiness ?? "not_started",
    },
    termsAcceptances: input.termsAccepted
      ? [{ termsVersion: "2026-05-22", acceptedAt: new Date("2026-05-22T00:00:00.000Z") }]
      : [],
  }
}

function queueReadiness(record: ReturnType<typeof readinessRecord>) {
  prismaMock.user.findUnique.mockResolvedValueOnce(record)
}

describe("readiness capability gates", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("allows Vouch creation for a merchant-capable user without requiring customer payment readiness", async () => {
    const { getCreateVouchReadinessGate } = await import("@/lib/fetchers/readinessFetchers")

    queueReadiness(
      readinessRecord({
        paymentMethodReady: "not_started",
        payoutReadiness: "ready",
        termsAccepted: true,
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
        termsAccepted: true,
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
        termsAccepted: true,
      })
    )

    await expect(getAcceptVouchReadinessGate({ userId: "user_1" })).resolves.toMatchObject({
      allowed: true,
      blockers: [],
    })
  })
})
