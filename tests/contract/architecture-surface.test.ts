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
  "app/api/stripe/webhooks/route.ts",
  "app/(tenant)/dashboard/page.tsx",
  "app/(tenant)/setup/page.tsx",
  "app/(tenant)/settings/payment/page.tsx",
  "app/(tenant)/settings/payout/page.tsx",
  "app/(tenant)/settings/verification/page.tsx",
  "app/(tenant)/vouches/page.tsx",
  "app/(tenant)/vouches/new/page.tsx",
  "app/(tenant)/vouches/[vouchId]/page.tsx",
  "app/(tenant)/vouches/[vouchId]/confirm/page.tsx",
  "app/(public)/vouches/invite/[token]/page.tsx",
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

const appRouteShellOnlyPatterns = [
  /@\/lib\/db\/prisma/,
  /@\/lib\/integrations\/stripe/,
  /\bprisma\./,
  /\bnew Stripe\b/,
  /\bstripe\.(paymentIntents|refunds|checkout|accounts|accountLinks|accountSessions)\b/,
]

function walk(directory: string): string[] {
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

describe("Vouch architecture surface", () => {
  it("keeps required route shells and architecture directories present", () => {
    for (const path of [...requiredRouteShells, ...requiredArchitectureDirectories]) {
      expect(existsSync(join(root, path))).toBe(true)
    }
  })

  it("keeps app page files free of persistence and provider SDK calls", () => {
    const appFiles = walk(join(root, "app")).filter(
      (path) => path.endsWith("/page.tsx") || path.endsWith("/layout.tsx")
    )

    for (const file of appFiles) {
      const content = readFileSync(join(root, file), "utf8")

      for (const pattern of appRouteShellOnlyPatterns) {
        expect(content).not.toMatch(pattern)
      }
    }
  })
})
