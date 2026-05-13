import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "playwright-report",
  "test-results",
  "prisma",
])

const requiredRouteShells = [
  "app/layout.tsx",
  "app/globals.css",
  "app/page.tsx",
  "app/loading.tsx",
  "app/not-found.tsx",
  "app/global-error.tsx",
  "app/(public)/layout.tsx",
  "app/(public)/loading.tsx",
  "app/(public)/error.tsx",
  "app/(public)/faq/page.tsx",
  "app/(public)/pricing/page.tsx",
  "app/(public)/legal/terms/page.tsx",
  "app/(public)/legal/privacy/page.tsx",
  "app/(public)/checkout/success/page.tsx",
  "app/(auth)/layout.tsx",
  "app/(auth)/loading.tsx",
  "app/(auth)/error.tsx",
  "app/(auth)/sign-in/[[...sign-in]]/page.tsx",
  "app/(auth)/sign-up/[[...sign-up]]/page.tsx",
  "app/(tenant)/layout.tsx",
  "app/(tenant)/loading.tsx",
  "app/(tenant)/error.tsx",
  "app/(tenant)/dashboard/page.tsx",
  "app/(tenant)/vouches/new/page.tsx",
  "app/(tenant)/vouches/new/confirm/page.tsx",
  "app/(tenant)/vouches/[vouchId]/page.tsx",
  "app/api/clerk/webhook-handler/route.ts",
  "app/api/stripe/webhooks/route.ts",
]

const requiredArchitectureDirectories = [
  "features",
  "components",
  "lib/actions",
  "lib/fetchers",
  "lib/db/transactions",
  "lib/integrations/stripe",
  "lib/auth",
  "lib/authz",
  "lib/vouch",
  "schemas",
  "types",
]

const forbiddenRouteShells = [
  "app/(tenant)/setup/page.tsx",
  "app/(tenant)/settings/page.tsx",
  "app/(tenant)/settings/payment/page.tsx",
  "app/(tenant)/settings/payment/return/page.tsx",
  "app/(tenant)/settings/payout/page.tsx",
  "app/(tenant)/settings/payout/return/page.tsx",
  "app/(tenant)/settings/verification/page.tsx",
  "app/(tenant)/readiness/page.tsx",
  "app/(tenant)/account/page.tsx",
  "app/(tenant)/profile/page.tsx",
  "app/(tenant)/admin/page.tsx",
  "app/(tenant)/admin/settlement/page.tsx",
  "app/(tenant)/messages/page.tsx",
  "app/(tenant)/disputes/page.tsx",
  "app/(tenant)/claims/page.tsx",
  "app/(tenant)/appeals/page.tsx",
  "app/(tenant)/evidence/page.tsx",
  "app/(tenant)/reviews/page.tsx",
  "app/(tenant)/ratings/page.tsx",
  "app/(tenant)/search/page.tsx",
  "app/(tenant)/browse/page.tsx",
  "app/(tenant)/providers/page.tsx",
  "app/(tenant)/marketplace/page.tsx",
  "app/(tenant)/vouches/page.tsx",
  "app/(tenant)/vouches/[vouchId]/confirm/page.tsx",
  "app/(public)/vouches/invite/[token]/page.tsx",
  "app/api/clerk/webhook-handler/route.ts",
  "app/api/vouches/create/route.ts",
  "app/api/vouches/confirm/route.ts",
  "app/api/vouches/capture/route.ts",
  "app/api/vouches/refund/route.ts",
  "app/api/accounts/create/route.ts",
  "app/api/accounts/session/route.ts",
  "app/api/payment/setup/route.ts",
  "app/api/payout/setup/route.ts",
  "app/api/admin/settlement/route.ts",
]

const forbiddenRoutePrefixes = [
  "app/(admin)/",
  "app/(tenant)/setup/",
  "app/(tenant)/settings/",
  "app/(tenant)/readiness/",
  "app/(tenant)/account/",
  "app/(tenant)/profile/",
  "app/(tenant)/admin/",
  "app/(tenant)/messages/",
  "app/(tenant)/disputes/",
  "app/(tenant)/claims/",
  "app/(tenant)/appeals/",
  "app/(tenant)/evidence/",
  "app/(tenant)/reviews/",
  "app/(tenant)/ratings/",
  "app/(tenant)/search/",
  "app/(tenant)/browse/",
  "app/(tenant)/providers/",
  "app/(tenant)/marketplace/",
  "app/(tenant)/vouches/[vouchId]/confirm/",
  "app/(public)/vouches/",
  "app/api/accounts/",
  "app/api/admin/",
  "app/api/payment/",
  "app/api/payout/",
  "app/api/vouches/",
]

const allowedApiRouteFiles = new Set([
  "app/api/clerk/webhooks/route.ts",
  "app/api/stripe/webhooks/route.ts",
])

const appRouteShellOnlyPatterns = [
  /@\/lib\/db\/prisma/,
  /@\/lib\/integrations\/stripe\/client/,
  /@\/lib\/integrations\/stripe\/connect/,
  /@\/lib\/integrations\/stripe\/checkout/,
  /@\/lib\/integrations\/stripe\/payment-intents/,
  /@\/lib\/integrations\/stripe\/refunds/,
  /\bprisma\./,
  /\bnew Stripe\b/,
  /\bstripe\.(paymentIntents|refunds|checkout|accounts|accountLinks|accountSessions)\b/,
]

const componentForbiddenPatterns = [
  /@\/lib\/db\/prisma/,
  /@\/lib\/db\/transactions/,
  /@\/lib\/integrations\/stripe/,
  /@clerk\/nextjs\/server/,
  /\bprisma\./,
  /\bnew Stripe\b/,
  /\bstripe\.(paymentIntents|refunds|checkout|accounts|accountLinks|accountSessions)\b/,
]

function walk(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = join(directory, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      if (ignoredDirectories.has(entry)) return []
      return walk(absolutePath)
    }

    return [relative(root, absolutePath).replaceAll("\\", "/")]
  })
}

function readProjectFile(file: string): string {
  return readFileSync(join(root, file), "utf8")
}

function expectFileNotToMatchPatterns(file: string, patterns: RegExp[], context: string): void {
  const content = readProjectFile(file)

  for (const pattern of patterns) {
    expect(
      content,
      `${context}: ${file} must not match forbidden pattern ${pattern.toString()}`
    ).not.toMatch(pattern)
  }
}

describe("Vouch architecture surface", () => {
  it("keeps required route shells and architecture directories present", () => {
    for (const path of [...requiredRouteShells, ...requiredArchitectureDirectories]) {
      expect(existsSync(join(root, path)), `Missing required path: ${path}`).toBe(true)
    }
  })

  it("keeps app page files free of persistence and provider SDK calls", () => {
    const appFiles = walk(join(root, "app")).filter(
      (path) => path.endsWith("/page.tsx") || path.endsWith("/layout.tsx")
    )

    for (const file of appFiles) {
      const content = readFileSync(join(root, file), "utf8")

      for (const pattern of appRouteShellOnlyPatterns) {
        expect(content, `App route shell violation in ${file}`).not.toMatch(pattern)
      }
    }
  })

  it("keeps provider route handlers as thin external boundaries", () => {
    const routeFiles = walk(join(root, "app", "api")).filter((path) => path.endsWith("/route.ts"))

    for (const file of routeFiles) {
      expectFileNotToMatchPatterns(file, appRouteShellOnlyPatterns, "API route boundary violation")
    }
  })

  it("keeps reusable components free of persistence, provider SDK, and Clerk server APIs", () => {
    const componentFiles = walk(join(root, "components")).filter(
      (path) => path.endsWith(".tsx") || path.endsWith(".ts")
    )

    for (const file of componentFiles) {
      expectFileNotToMatchPatterns(file, componentForbiddenPatterns, "Component purity violation")
    }
  })
})
