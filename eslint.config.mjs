import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"
import reactHookForm from "eslint-plugin-react-hook-form"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,

  {
    name: "vouch/react-hook-form",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hook-form": reactHookForm,
    },
    rules: {
      "react-hook-form/destructuring-formstate": "error",
      "react-hook-form/no-access-control": "error",
      "react-hook-form/no-nested-object-setvalue": "error",
      "react-hook-form/no-use-watch": "warn",
    },
  },

  {
    name: "vouch/base-rules",
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],

      /*
       * React 19 / Next App Router.
       * Next already configures React + React Hooks. These only remove obsolete friction.
       */
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  {
    name: "vouch/app-and-component-boundaries",
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@prisma/client",
                "@/lib/db/prisma",
                "@/generated/prisma/*",
                "@/prisma/*",
              ],
              message:
                "Do not import Prisma directly in app/ or components/. Use server fetchers/actions/selects/transactions.",
            },
            {
              group: ["stripe"],
              message:
                "Do not import Stripe directly in app/ or components/. Use payment server actions/adapters.",
            },
            {
              group: ["server-only"],
              message:
                "Do not import server-only into shared UI. Keep server-only boundaries in lib/, features server components, or route handlers.",
            },
          ],
        },
      ],
    },
  },

  {
    name: "vouch/app-route-shell-boundaries",
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@prisma/client",
                "@/lib/db/*",
                "@/lib/*/transactions/*",
                "@/lib/*/selects/*",
              ],
              message:
                "app/ must stay route-shell-only. Move reads/writes into lib/<domain>/fetchers or lib/<domain>/actions.",
            },
          ],
        },
      ],
    },
  },

  {
    name: "vouch/component-purity",
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/actions/*",
                "@/lib/*/actions/*",
                "@/lib/fetchers/*",
                "@/lib/*/fetchers/*",
                "@/lib/db/*",
                "@/lib/auth/*",
                "@/lib/authz/*",
              ],
              message:
                "Reusable components must stay presentational. Pass data and callbacks from features.",
            },
          ],
        },
      ],
    },
  },

  /*
   * Must be near the end. Disables ESLint formatting rules that conflict with Prettier.
   */
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
