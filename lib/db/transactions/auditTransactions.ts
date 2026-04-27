import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type { AuditEntityType, AuditEventName, WriteAuditEventInput } from "@/types/audit"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

function assertAuditEntityType(input: WriteAuditEventInput, entityType: AuditEntityType): void {
  if (input.entityType !== entityType) {
    throw new Error(`INVALID_AUDIT_ENTITY_TYPE: expected ${entityType}`)
  }
}

function assertAuditEventPrefix(input: WriteAuditEventInput, prefix: string): void {
  if (!input.eventName.startsWith(prefix)) {
    throw new Error(`INVALID_AUDIT_EVENT_NAME: expected ${prefix}*`)
  }
}

function assertAuditEventName(
  input: WriteAuditEventInput,
  allowed: readonly AuditEventName[]
): void {
  if (!allowed.includes(input.eventName)) {
    throw new Error(`INVALID_AUDIT_EVENT_NAME: ${input.eventName}`)
  }
}

export async function writeAuditEventTx(_tx: Tx, _input: WriteAuditEventInput): Promise<void> {
  return
}

export async function writeUserAuditEventTx(tx: Tx, input: WriteAuditEventInput): Promise<void> {
  assertAuditEntityType(input, "User")
  assertAuditEventPrefix(input, "user.")

  await writeAuditEventTx(tx, input)
}

export async function writeAuthProviderAuditEventTx(
  tx: Tx,
  input: WriteAuditEventInput
): Promise<void> {
  assertAuditEntityType(input, "User")
  assertAuditEventName(input, ["user.created", "user.signed_in"])

  await writeAuditEventTx(tx, input)
}

export async function writeVerificationAuditEventTx(
  tx: Tx,
  input: WriteAuditEventInput
): Promise<void> {
  assertAuditEntityType(input, "VerificationProfile")
  assertAuditEventName(input, [
    "user.verification.started",
    "user.verification.completed",
    "user.verification.rejected",
  ])

  await writeAuditEventTx(tx, input)
}

export async function writeVouchAuditEventTx(tx: Tx, input: WriteAuditEventInput): Promise<void> {
  assertAuditEntityType(input, "Vouch")
  assertAuditEventPrefix(input, "vouch.")

  await writeAuditEventTx(tx, input)
}

export async function writePaymentAuditEventTx(tx: Tx, input: WriteAuditEventInput): Promise<void> {
  assertAuditEventName(input, [
    "payment.initialized",
    "payment.authorized",
    "payment.captured",
    "payment.release_requested",
    "payment.released",
    "payment.refund_requested",
    "payment.refunded",
    "payment.voided",
    "payment.failed",
    "payment.reconciliation_failed",
  ])

  await writeAuditEventTx(tx, input)
}

export async function writeWebhookAuditEventTx(tx: Tx, input: WriteAuditEventInput): Promise<void> {
  assertAuditEntityType(input, "PaymentWebhookEvent")
  assertAuditEventName(input, [
    "payment.webhook_received",
    "payment.webhook_processed",
    "payment.webhook_ignored",
  ])

  await writeAuditEventTx(tx, input)
}

export async function writeNotificationAuditEventTx(
  tx: Tx,
  input: WriteAuditEventInput
): Promise<void> {
  assertAuditEntityType(input, "NotificationEvent")

  await writeAuditEventTx(tx, input)
}

export async function writeAdminAuditEventTx(tx: Tx, input: WriteAuditEventInput): Promise<void> {
  assertAuditEventPrefix(input, "admin.")

  await writeAuditEventTx(tx, input)
}
