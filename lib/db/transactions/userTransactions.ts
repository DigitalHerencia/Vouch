import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type { LocalUserSyncInput } from "@/lib/auth/clerk"
import type { PrivateAccountInfo, UserStatus } from "@/types/user"
import { profileBasicsInputSchema, userStatusChangeInputSchema } from "@/schemas/user"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type UserTxResult = PrivateAccountInfo & {
  clerkUserId: string
}

const USER_PRIVATE_ACCOUNT_SELECT = {
  id: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  clerkUserId: true,
} as const

type SelectedUserRow = {
  id: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: UserStatus
  clerkUserId: string
}

function toPrivateAccountInfo(user: SelectedUserRow): UserTxResult {
  return {
    userId: user.id,
    ...(user.email !== null ? { email: user.email } : {}),
    ...(user.phone !== null ? { phone: user.phone } : {}),
    ...(user.displayName !== null ? { displayName: user.displayName } : {}),
    status: user.status,
    clerkUserId: user.clerkUserId,
  }
}
export async function createUserTx(tx: Tx, input: LocalUserSyncInput): Promise<UserTxResult> {
  const user = await tx.user.create({
    data: {
      clerkUserId: input.clerkUserId,
      email: input.email ?? null,
      phone: input.phone ?? null,
      displayName: input.displayName ?? null,
      status: "active",
    },
    select: USER_PRIVATE_ACCOUNT_SELECT,
  })

  return toPrivateAccountInfo(user)
}

export async function updateUserPrivateAccountInfoTx(
  tx: Tx,
  input: {
    clerkUserId: string
    displayName?: string
    phone?: string
  }
): Promise<UserTxResult> {
  const parsed = profileBasicsInputSchema.parse({
    displayName: input.displayName,
    phone: input.phone,
  })

  const user = await tx.user.update({
    where: {
      clerkUserId: input.clerkUserId,
    },
    data: {
      ...(parsed.displayName !== undefined && {
        displayName: parsed.displayName,
      }),
      ...(parsed.phone !== undefined && {
        phone: parsed.phone,
      }),
    },
    select: USER_PRIVATE_ACCOUNT_SELECT,
  })

  return toPrivateAccountInfo(user)
}

export async function updateUserStatusTx(
  tx: Tx,
  input: {
    userId: string
    status: UserStatus
    reason?: string
  }
): Promise<UserTxResult> {
  const parsed = userStatusChangeInputSchema.parse({
    userId: input.userId,
    reason: input.reason,
  })

  const user = await tx.user.update({
    where: {
      id: parsed.userId,
    },
    data: {
      status: input.status,
    },
    select: USER_PRIVATE_ACCOUNT_SELECT,
  })

  return toPrivateAccountInfo(user)
}

export async function disableUserTx(
  tx: Tx,
  input: {
    userId: string
    reason?: string
  }
): Promise<UserTxResult> {
  return updateUserStatusTx(tx, {
    userId: input.userId,
    status: "disabled",
    ...(input.reason !== undefined ? { reason: input.reason } : {}),
  })
}

export async function reactivateUserTx(
  tx: Tx,
  input: {
    userId: string
    reason?: string
  }
): Promise<UserTxResult> {
  return updateUserStatusTx(tx, {
    userId: input.userId,
    status: "active",
    ...(input.reason !== undefined ? { reason: input.reason } : {}),
  })
}

export async function updateLastSignedInAtTx(
  tx: Tx,
  input: {
    userId: string
    lastSignedInAt?: Date
  }
): Promise<UserTxResult> {
  const user = await tx.user.update({
    where: {
      id: input.userId,
    },
    data: {
      lastSignedInAt: input.lastSignedInAt ?? new Date(),
    },
    select: USER_PRIVATE_ACCOUNT_SELECT,
  })

  return toPrivateAccountInfo(user)
}
