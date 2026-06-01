// lib/auth/clerk.ts

import "server-only"

import { auth, currentUser, type User as ClerkUser } from "@clerk/nextjs/server"

export async function getCurrentClerkAuth() {
  return auth()
}

export async function getCurrentClerkUserId() {
  const session = await getCurrentClerkAuth()
  return session.userId
}

export async function getCurrentClerkUser() {
  return currentUser()
}

export function extractPrimaryEmailFromClerkUser(
  user: ClerkUserLike | ClerkUser
): string | undefined {
  const primary = user.emailAddresses?.find((email) => email.id === user.primaryEmailAddressId)
  return primary?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress
}

export function extractPrimaryPhoneFromClerkUser(
  user: ClerkUserLike | ClerkUser
): string | undefined {
  const primary = user.phoneNumbers?.find((phone) => phone.id === user.primaryPhoneNumberId)
  return primary?.phoneNumber ?? user.phoneNumbers?.[0]?.phoneNumber
}

export function extractDisplayNameFromClerkUser(
  user: ClerkUserLike | ClerkUser
): string | undefined {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || user.username || extractPrimaryEmailFromClerkUser(user)
}

export function mapClerkUserToLocalInput(user: ClerkUserLike | ClerkUser): LocalUserSyncInput {
  const input: LocalUserSyncInput = {
    clerkUserId: user.id,
  }
  const email = extractPrimaryEmailFromClerkUser(user)
  const phone = extractPrimaryPhoneFromClerkUser(user)
  const displayName = extractDisplayNameFromClerkUser(user)

  if (email) input.email = email
  if (phone) input.phone = phone
  if (displayName) input.displayName = displayName

  return input
}
