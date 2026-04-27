import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type { AdminDisableUserInput, AdminSafeRetryInput } from "@/types/admin"
import { adminDisableUserInputSchema, adminSafeRetryInputSchema } from "@/schemas/admin"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function disableUserOperationallyTx(
  tx: Tx,
  input: AdminDisableUserInput
): Promise<void> {
  const parsed = adminDisableUserInputSchema.parse(input)

  await tx.user.update({
    where: {
      id: parsed.userId,
    },
    data: {
      status: "disabled",
    },
  })
}

export async function recordAdminViewedUserTx(
  _tx: Tx,
  _input: {
    adminUserId: string
    viewedUserId: string
  }
): Promise<void> {
  return
}

export async function recordAdminViewedVouchTx(
  _tx: Tx,
  _input: {
    adminUserId: string
    viewedVouchId: string
  }
): Promise<void> {
  return
}

export async function recordAdminViewedPaymentTx(
  _tx: Tx,
  _input: {
    adminUserId: string
    viewedPaymentId: string
  }
): Promise<void> {
  return
}

export async function recordAdminSafeRetryStartedTx(
  _tx: Tx,
  input: AdminSafeRetryInput
): Promise<void> {
  adminSafeRetryInputSchema.parse(input)
}

export async function recordAdminSafeRetryCompletedTx(
  _tx: Tx,
  input: AdminSafeRetryInput
): Promise<void> {
  adminSafeRetryInputSchema.parse(input)
}

export async function recordAdminSafeRetryFailedTx(
  _tx: Tx,
  input: AdminSafeRetryInput
): Promise<void> {
  adminSafeRetryInputSchema.parse(input)
}
