"use server"

import { revalidatePath } from "next/cache"

import type { LocalUserSyncInput } from "@/lib/auth/clerk"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCapability } from "@/lib/auth/authorization/capabilities"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  upsertUserFromClerkTx,
} from "@/lib/actions/transactions/authTransactions"
import {
  disableUserTx,
  reactivateUserTx,
  updateUserPrivateAccountInfoTx,
} from "@/lib/actions/transactions/userTransactions"
import {
  authProviderUserInputSchema,
  profileBasicsInputSchema,
  userStatusChangeInputSchema,
} from "@/schemas/user"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { PrivateAccountInfo } from "@/types/user"

type FieldErrors = Record<string, string[]>

type UserActionResult = PrivateAccountInfo & {
  clerkUserId: string
}

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= []
    fieldErrors[field].push(issue.message)
  }

  return fieldErrors
}

function toActionUserResult(user: UserActionResult): UserActionResult {
  return {
    userId: user.userId,
    clerkUserId: user.clerkUserId,
    status: user.status,
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.displayName ? { displayName: user.displayName } : {}),
  }
}

export async function upsertUserFromAuthProvider(
  input: unknown
): Promise<ActionResult<UserActionResult>> {
  const parsed = authProviderUserInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the auth provider user payload.",
      getFieldErrors(parsed.error)
    )
  }

  const syncInput: LocalUserSyncInput = {
    clerkUserId: parsed.data.clerkUserId,
    ...(parsed.data.email ? { email: parsed.data.email } : {}),
    ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    ...(parsed.data.displayName ? { displayName: parsed.data.displayName } : {}),
  }

  const user = await prisma.$transaction(async (tx) => {
    const syncedUser = await upsertUserFromClerkTx(tx, syncInput)
    await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })

    await tx.auditEvent.create({
      data: {
        eventName: "user.created",
        actorType: "auth_provider",
        entityType: "User",
        entityId: syncedUser.id,
        participantSafe: false,
        metadata: {
          clerk_user_id: syncedUser.clerkUserId,
        },
      },
    })

    return syncedUser
  })

  revalidatePath("/dashboard")
  revalidatePath("/setup")
  revalidatePath("/settings")

  return actionSuccess({
    userId: user.id,
    clerkUserId: user.clerkUserId,
    status: user.status,
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.displayName ? { displayName: user.displayName } : {}),
  })
}

export async function updatePrivateAccountInfo(
  input: unknown
): Promise<ActionResult<UserActionResult>> {
  const user = await requireActiveUser()
  const parsed = profileBasicsInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the account fields.",
      getFieldErrors(parsed.error)
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const account = await updateUserPrivateAccountInfoTx(tx, {
      clerkUserId: user.clerkUserId,
      ...(parsed.data.displayName ? { displayName: parsed.data.displayName } : {}),
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "user.updated",
        actorType: "user",
        actorUserId: user.id,
        entityType: "User",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          updated_fields: Object.keys(parsed.data),
        },
      },
    })

    return account
  })

  revalidatePath("/settings")
  revalidatePath("/setup")
  revalidatePath("/dashboard")

  return actionSuccess(toActionUserResult(updated))
}

export async function markUserDisabled(input: unknown): Promise<ActionResult<UserActionResult>> {
  const admin = await requireActiveUser()
  assertCapability(admin, "disable_user_account")

  const parsed = userStatusChangeInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the user disable fields.",
      getFieldErrors(parsed.error)
    )
  }

  if (parsed.data.userId === admin.id) {
    return actionFailure("SELF_DISABLE_BLOCKED", "Admins cannot disable their own account.")
  }

  const disabled = await prisma.$transaction(async (tx) => {
    const account = await disableUserTx(tx, {
      userId: parsed.data.userId,
      ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.account.disabled",
        actorType: "admin",
        actorUserId: admin.id,
        entityType: "User",
        entityId: parsed.data.userId,
        participantSafe: false,
        metadata: {
          ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
        },
      },
    })

    return account
  })

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${parsed.data.userId}`)

  return actionSuccess(toActionUserResult(disabled))
}

export async function markUserActive(input: unknown): Promise<ActionResult<UserActionResult>> {
  const admin = await requireActiveUser()
  assertCapability(admin, "disable_user_account")

  const parsed = userStatusChangeInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the user activation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const activated = await prisma.$transaction(async (tx) => {
    const account = await reactivateUserTx(tx, {
      userId: parsed.data.userId,
      ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.retry.completed",
        actorType: "admin",
        actorUserId: admin.id,
        entityType: "User",
        entityId: parsed.data.userId,
        participantSafe: false,
        metadata: {
          operation: "reactivate_user_account",
          ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
        },
      },
    })

    return account
  })

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${parsed.data.userId}`)

  return actionSuccess(toActionUserResult(activated))
}
