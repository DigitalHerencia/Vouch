import { beforeEach, describe, expect, it, vi } from "vitest"

const workflows = vi.hoisted(() => ({
  archiveVouch: vi.fn(),
  calculatePlatformFee: vi.fn(),
  claimCustomerAuthorizationCheckout: vi.fn(),
  confirmPresence: vi.fn(),
  confirmPresenceFormAction: vi.fn(),
  createVouch: vi.fn(),
  getCustomerAuthorizationCheckoutForAuthenticatedUser: vi.fn(),
  getCreateVouchFormReadiness: vi.fn(),
  validateCreateVouchDraft: vi.fn(),
}))

vi.mock("@/lib/vouch/workflows", () => workflows)

import {
  archiveVouch,
  calculatePlatformFee,
  claimCustomerAuthorizationCheckout,
  confirmPresence,
  confirmPresenceFormAction,
  createVouch,
  getCustomerAuthorizationCheckoutForAuthenticatedUser,
  getCreateVouchFormReadiness,
  validateCreateVouchDraft,
} from "@/lib/actions/vouchActions"

describe("Vouch Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    [
      "calculatePlatformFee",
      calculatePlatformFee,
      workflows.calculatePlatformFee,
      { amountCents: 500 },
    ],
    [
      "validateCreateVouchDraft",
      validateCreateVouchDraft,
      workflows.validateCreateVouchDraft,
      { amountCents: 500 },
    ],
    ["createVouch", createVouch, workflows.createVouch, { amountCents: 500 }],
    ["confirmPresence", confirmPresence, workflows.confirmPresence, { vouchId: "vouch_1" }],
    ["archiveVouch", archiveVouch, workflows.archiveVouch, { vouchId: "vouch_1" }],
  ])("%s delegates input and returns the workflow result", async (_, action, workflow, input) => {
    const expected = { ok: true, data: { value: "result" } }
    workflow.mockResolvedValueOnce(expected)

    await expect(action(input)).resolves.toBe(expected)
    expect(workflow).toHaveBeenCalledWith(input)
  })

  it("delegates readiness options", async () => {
    const input = { syncStripeConnectReturn: true }
    const expected = { ok: true, data: { onboardingRequired: false } }
    workflows.getCreateVouchFormReadiness.mockResolvedValueOnce(expected)

    await expect(getCreateVouchFormReadiness(input)).resolves.toBe(expected)
    expect(workflows.getCreateVouchFormReadiness).toHaveBeenCalledWith(input)
  })

  it("delegates customer authorization checkout operations", async () => {
    const claimInput = { checkoutSessionId: "cs_1", revalidate: true }
    const lookupInput = { publicId: "VCH-1" }
    workflows.claimCustomerAuthorizationCheckout.mockResolvedValueOnce({ ok: true })
    workflows.getCustomerAuthorizationCheckoutForAuthenticatedUser.mockResolvedValueOnce({
      ok: true,
    })

    await claimCustomerAuthorizationCheckout(claimInput)
    await getCustomerAuthorizationCheckoutForAuthenticatedUser(lookupInput)

    expect(workflows.claimCustomerAuthorizationCheckout).toHaveBeenCalledWith(claimInput)
    expect(workflows.getCustomerAuthorizationCheckoutForAuthenticatedUser).toHaveBeenCalledWith(
      lookupInput
    )
  })

  it("delegates FormData confirmation actions", async () => {
    const formData = new FormData()
    formData.set("vouchId", "vouch_1")

    await confirmPresenceFormAction(formData)

    expect(workflows.confirmPresenceFormAction).toHaveBeenCalledWith(formData)
  })
})
