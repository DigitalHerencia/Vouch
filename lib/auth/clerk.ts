// lib/auth/clerk.ts

import "server-only"

import { auth } from "@clerk/nextjs/server"

export async function getCurrentClerkAuth() {
  return auth()
}
