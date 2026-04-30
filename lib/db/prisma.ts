// src/lib/db/prisma.ts
import { config } from "dotenv"
import { PrismaClient } from "@/prisma/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

config({ path: ".env" })
config({ path: ".env.local", override: true })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })
