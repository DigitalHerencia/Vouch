import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const userSafeIdentitySelect = {
  id: true,
  displayName: true,
  email: true,
  status: true,
} as const satisfies Prisma.UserSelect
