import { globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"

const eslintConfig = [
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
            "generated/prisma/**",
            "src/generated/prisma/**",
            "*.config.js",
            "*.config.cjs",
            "next-env.d.ts",
        ],
        "Vouch global ignores",
    ),

    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        rules: {
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "@next/next/no-html-link-for-pages": "off",
        },
    },

    {
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
                            ],
                            message:
                                "Do not import Prisma directly in app/ or components/. Use fetchers/actions/selects/transactions.",
                        },
                        {
                            group: ["stripe"],
                            message:
                                "Do not import Stripe directly in app/ or components/. Use payment server actions/adapters.",
                        },
                    ],
                },
            ],
        },
    },

    {
        files: ["components/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: [
                                "@/lib/actions/*",
                                "@/lib/fetcher/*",
                                "@/lib/db/*",
                            ],
                            message:
                                "Reusable components must stay presentational. Pass data/callbacks from features.",
                        },
                    ],
                },
            ],
        },
    },
]

export default eslintConfig
