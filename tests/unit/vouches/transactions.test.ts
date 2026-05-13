import { describe, expect, it, vi } from "vitest"

import { bindPayeeToVouchTx } from "@/lib/db/transactions/vouchTransactions"

const vouchRecord = {
  id: "vouch_1",
  publicId: "vch_public",
  merchantId: "merchant_1",
  customerId: "customer_1",
  currency: "usd",
  protectedAmountCents: 10_000,
  merchantReceivesCents: 10_000,
  vouchServiceFeeCents: 500,
  processingFeeOffsetCents: 46,
  applicationFeeAmountCents: 0,
  customerTotalCents: 10_000,
  status: "accepted",
  archiveStatus: "active",
  recoveryStatus: "normal",
  label: null,
  appointmentStartsAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationOpensAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationExpiresAt: new Date("2026-05-01T17:00:00.000Z"),
  committedAt: new Date("2026-05-01T14:00:00.000Z"),
  sentAt: new Date("2026-05-01T14:30:00.000Z"),
  acceptedAt: new Date("2026-05-01T15:00:00.000Z"),
  authorizedAt: null,
  confirmableAt: null,
  completedAt: null,
  expiredAt: null,
  createdAt: new Date("2026-04-28T00:00:00.000Z"),
  updatedAt: new Date("2026-04-28T00:00:00.000Z"),
}

describe("vouch transaction helpers", () => {
  it("accepts only a sent Vouch without an existing customer", async () => {
    const tx = {
      vouch: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue(vouchRecord),
      },
    }

    await expect(
      bindPayeeToVouchTx(tx as never, { vouchId: "vouch_1", customerId: "customer_1" })
    ).resolves.toMatchObject({ id: "vouch_1", status: "accepted", customerId: "customer_1" })

    expect(tx.vouch.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "vouch_1",
          status: { in: ["committed", "sent"] },
          customerId: null,
          merchantId: { not: "customer_1" },
        },
      })
    )
  })

  it("throws a conflict when the guarded accept update does not win", async () => {
    const tx = {
      vouch: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUniqueOrThrow: vi.fn(),
      },
    }

    await expect(
      bindPayeeToVouchTx(tx as never, { vouchId: "vouch_1", customerId: "customer_1" })
    ).rejects.toThrow("VOUCH_ACCEPTANCE_CONFLICT")

    expect(tx.vouch.findUniqueOrThrow).not.toHaveBeenCalled()
  })
})
