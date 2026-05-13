import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"
import reactPlugin from "eslint-plugin-react"

const disabledReactPluginRules = Object.fromEntries(
  Object.keys(reactPlugin.rules).map((ruleName) => [`react/${ruleName}`, "off"])
)

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,

  {
    rules: disabledReactPluginRules,
  },

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
      ".agents/**",

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
