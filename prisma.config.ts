// prisma.config.ts
import { config } from "dotenv"
import { defineConfig } from "prisma/config"

config({ path: ".env" })
config({ path: ".env.local", override: true })

const migrationDatabaseUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!migrationDatabaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_DATABASE_URL is required")
}

export default defineConfig({
  datasource: {
    url: migrationDatabaseUrl,
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
})
