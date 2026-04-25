// src/lib/db/prisma.ts
import { PrismaClient } from "@/prisma/generated/prisma/client"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })
