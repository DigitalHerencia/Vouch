import { describe, expect, it, vi } from "vitest"

import { bindPayeeToVouchTx } from "@/lib/actions/transactions/vouchTransactions"

const vouchRecord = {
  id: "vouch_1",
  publicId: "vch_public",
  payerId: "payer_1",
  payeeId: "payee_1",
  amountCents: 10_000,
  currency: "usd",
  platformFeeCents: 500,
  status: "active",
  label: null,
  meetingStartsAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationOpensAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationExpiresAt: new Date("2026-05-01T17:00:00.000Z"),
  acceptedAt: new Date("2026-05-01T15:00:00.000Z"),
  completedAt: null,
  expiredAt: null,
  canceledAt: null,
  failedAt: null,
  createdAt: new Date("2026-04-28T00:00:00.000Z"),
  updatedAt: new Date("2026-04-28T00:00:00.000Z"),
}

describe("vouch transaction helpers", () => {
  it("accepts only a pending Vouch without an existing payee", async () => {
    const tx = {
      vouch: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue(vouchRecord),
      },
    }

    await expect(
      bindPayeeToVouchTx(tx as never, { vouchId: "vouch_1", payeeId: "payee_1" })
    ).resolves.toMatchObject({ id: "vouch_1", status: "active", payeeId: "payee_1" })

    expect(tx.vouch.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "vouch_1",
          status: "pending",
          payeeId: null,
          payerId: { not: "payee_1" },
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
      bindPayeeToVouchTx(tx as never, { vouchId: "vouch_1", payeeId: "payee_1" })
    ).rejects.toThrow("VOUCH_ACCEPTANCE_CONFLICT")

    expect(tx.vouch.findUniqueOrThrow).not.toHaveBeenCalled()
  })
})
