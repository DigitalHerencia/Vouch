// prisma.config.ts
import { config } from "dotenv"
import { defineConfig, type PrismaConfig } from "prisma/config"

config({ path: ".env", quiet: true })
config({ path: ".env.local", override: true, quiet: true })

const migrationDatabaseUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

const datasource: PrismaConfig["datasource"] | undefined = migrationDatabaseUrl
  ? {
      url: migrationDatabaseUrl,
      ...(process.env.SHADOW_DATABASE_URL
        ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
        : {}),
    }
  : undefined

export default defineConfig({
  ...(datasource ? { datasource } : {}),
})
