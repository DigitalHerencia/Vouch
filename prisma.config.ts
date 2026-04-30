// prisma.config.ts
import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

config({ path: ".env" })
config({ path: ".env.local", override: true })

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
})
