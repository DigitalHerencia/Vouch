import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,

  prettier,

  globalIgnores(
    [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",

      "generated/**",
      "src/generated/**",
      "prisma/generated/**",

      "next-env.d.ts",
      "*.config.js",
      "*.config.cjs",
    ],
    "Vouch global ignores"
  ),
])

export default eslintConfig
