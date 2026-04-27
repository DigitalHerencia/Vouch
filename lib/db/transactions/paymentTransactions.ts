import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function upsertPaymentCustomerTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function updatePaymentReadinessTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function upsertConnectedAccountTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function updateConnectedAccountReadinessTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function updateConnectedAccountCapabilitiesTx(
  _tx: Tx,
  _input?: unknown
): Promise<void> {
  return
}

export async function createPaymentRecordTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function updatePaymentRecordStatusTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentAuthorizedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentCapturedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentReleasePendingTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentReleasedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentRefundPendingTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentRefundedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentVoidedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentFailedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function createRefundRecordTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function updateRefundRecordStatusTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markRefundSucceededTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markRefundFailedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function recordPaymentWebhookEventTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentWebhookProcessedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentWebhookIgnoredTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}

export async function markPaymentWebhookFailedTx(_tx: Tx, _input?: unknown): Promise<void> {
  return
}
