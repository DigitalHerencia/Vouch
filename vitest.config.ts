import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/contract/**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules",
      ".next",
      "out",
      "coverage",
      "playwright-report",
      "test-results",
      "generated/prisma",
      "src/generated/prisma",
      "tests/e2e/**",
      "**/*.spec.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "next-env.d.ts",
        "**/*.config.{ts,mts,js,mjs}",
        "generated/prisma/**",
        "src/generated/prisma/**",
        ".next/**",
        "coverage/**",
        "playwright-report/**",
        "test-results/**",
        "tests/e2e/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
})
