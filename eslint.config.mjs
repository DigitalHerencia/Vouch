import { globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"

const eslintConfig = [
    ...nextVitals,
    ...nextTypescript,
    prettier,

    {
        rules: {
            "react/display-name": "off",
            "react/jsx-key": "off",
            "react/jsx-no-comment-textnodes": "off",
            "react/jsx-no-duplicate-props": "off",
            "react/jsx-no-target-blank": "off",
            "react/jsx-no-undef": "off",
            "react/jsx-uses-react": "off",
            "react/jsx-uses-vars": "off",
            "react/no-children-prop": "off",
            "react/no-danger-with-children": "off",
            "react/no-deprecated": "off",
            "react/no-direct-mutation-state": "off",
            "react/no-find-dom-node": "off",
            "react/no-is-mounted": "off",
            "react/no-render-return-value": "off",
            "react/no-string-refs": "off",
            "react/no-unescaped-entities": "off",
            "react/no-unknown-property": "off",
            "react/no-unsafe": "off",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            "react/require-render-return": "off",
            "react/jsx-child-element-spacing": "off",
            "react/jsx-closing-bracket-location": "off",
            "react/jsx-closing-tag-location": "off",
            "react/jsx-curly-newline": "off",
            "react/jsx-curly-spacing": "off",
            "react/jsx-equals-spacing": "off",
            "react/jsx-first-prop-new-line": "off",
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-one-expression-per-line": "off",
            "react/jsx-props-no-multi-spaces": "off",
            "react/jsx-space-before-closing": "off",
            "react/jsx-tag-spacing": "off",
            "react/jsx-wrap-multilines": "off",
        },
    },

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
            "react/display-name": "off",
            "react/jsx-key": "off",
            "react/jsx-no-comment-textnodes": "off",
            "react/jsx-no-duplicate-props": "off",
            "react/jsx-no-target-blank": "off",
            "react/jsx-no-undef": "off",
            "react/jsx-uses-react": "off",
            "react/jsx-uses-vars": "off",
            "react/no-children-prop": "off",
            "react/no-danger-with-children": "off",
            "react/no-deprecated": "off",
            "react/no-direct-mutation-state": "off",
            "react/no-find-dom-node": "off",
            "react/no-is-mounted": "off",
            "react/no-render-return-value": "off",
            "react/no-string-refs": "off",
            "react/no-unescaped-entities": "off",
            "react/no-unknown-property": "off",
            "react/no-unsafe": "off",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            "react/require-render-return": "off",
            "react/jsx-child-element-spacing": "off",
            "react/jsx-closing-bracket-location": "off",
            "react/jsx-closing-tag-location": "off",
            "react/jsx-curly-newline": "off",
            "react/jsx-curly-spacing": "off",
            "react/jsx-equals-spacing": "off",
            "react/jsx-first-prop-new-line": "off",
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-one-expression-per-line": "off",
            "react/jsx-props-no-multi-spaces": "off",
            "react/jsx-space-before-closing": "off",
            "react/jsx-tag-spacing": "off",
            "react/jsx-wrap-multilines": "off",
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
