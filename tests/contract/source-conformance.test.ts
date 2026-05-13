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
  "prisma/generated",
])

const sourceFilesToScan = ["app", "components", "features", "lib", "schemas", "types", "tests"]

const forbiddenRouteFragments = [
  "/setup",
  "/settings",
  "/settings/payment",
  "/settings/payout",
  "/settings/verification",
  "/readiness",
  "/account",
  "/profile",
  "/admin",
  "/messages",
  "/disputes",
  "/claims",
  "/appeals",
  "/evidence",
  "/reviews",
  "/ratings",
  "/search",
  "/browse",
  "/providers",
  "/marketplace",
  "/vouches/invite",
  "/confirm",
]

const forbiddenProductTerms = [
  "marketplace",
  "broker",
  "escrow",
  "dispute resolution",
  "mediation",
  "arbitration",
  "evidence upload",
  "evidence review",
  "manual release",
  "force release",
  "manual award",
  "support override",
  "manual confirmation",
  "provider directory",
  "service listing",
  "public profile",
  "review score",
  "rating score",
]

const obsoleteVouchStatusValues = [
  '"pending"',
  '"active"',
  '"refunded"',
  '"canceled"',
  '"failed"',
  '"voided"',
  '"provider_restricted"',
  '"capture_failed"',
  '"refund_failed"',
]

const forbiddenConfirmationMethods = ['"manual"', '"gps"', '"system"']
const forbiddenParticipantRoles = ['"payer"', '"payee"']

function walk(directory: string): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = join(directory, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      const relativePath = relative(root, absolutePath).replaceAll("\\", "/")
      if (ignoredDirectories.has(entry) || ignoredDirectories.has(relativePath)) return []
      return walk(absolutePath)
    }

    return [relative(root, absolutePath).replaceAll("\\", "/")]
  })
}

function projectFiles(): string[] {
  return sourceFilesToScan
    .flatMap((path) => walk(join(root, path)))
    .filter((path) => {
      return (
        path.endsWith(".ts") ||
        path.endsWith(".tsx") ||
        path.endsWith(".md") ||
        path.endsWith(".json") ||
        path.endsWith(".yaml") ||
        path.endsWith(".yml")
      )
    })
}

function readProjectFile(path: string): string {
  return readFileSync(join(root, path), "utf8")
}

function expectFileNotToContain(file: string, values: string[], context: string): void {
  const content = readProjectFile(file).toLowerCase()

  for (const value of values) {
    expect(content, `${context}: ${file} must not contain ${value}`).not.toContain(
      value.toLowerCase()
    )
  }
}

describe("Vouch source conformance", () => {
  it("keeps forbidden route fragments out of navigation, links, and redirects", () => {
    const files = projectFiles().filter(
      (file) =>
        file.startsWith("app/") || file.startsWith("components/") || file.startsWith("features/")
    )

    for (const file of files) {
      expectFileNotToContain(file, forbiddenRouteFragments, "Forbidden route reference")
    }
  })

  it("keeps forbidden product categories out of UI and public content", () => {
    const files = projectFiles().filter(
      (file) =>
        file.startsWith("app/") || file.startsWith("components/") || file.startsWith("features/")
    )

    for (const file of files) {
      expectFileNotToContain(file, forbiddenProductTerms, "Forbidden product framing")
    }
  })

  it("keeps obsolete Vouch lifecycle values out of canonical constants and schemas", () => {
    const files = ["lib/vouch/constants.ts", "schemas/vouch.ts", "types/vouch.ts"].filter((file) =>
      existsSync(join(root, file))
    )

    for (const file of files) {
      expectFileNotToContain(file, obsoleteVouchStatusValues, "Obsolete VouchStatus value")
    }
  })

  it("keeps noncanonical confirmation methods out of constants and schemas", () => {
    const files = ["lib/vouch/constants.ts", "schemas/vouch.ts", "types/vouch.ts"].filter((file) =>
      existsSync(join(root, file))
    )

    for (const file of files) {
      expectFileNotToContain(file, forbiddenConfirmationMethods, "Forbidden confirmation method")
    }
  })

  it("keeps payer/payee out of canonical Vouch role constants and schemas", () => {
    const files = ["lib/vouch/constants.ts", "schemas/vouch.ts", "types/vouch.ts"].filter((file) =>
      existsSync(join(root, file))
    )

    for (const file of files) {
      expectFileNotToContain(
        file,
        forbiddenParticipantRoles,
        "Forbidden canonical participant role"
      )
    }
  })

  it("keeps generated Prisma files untracked by source conformance checks", () => {
    const files = projectFiles()
    expect(files.some((file) => file.startsWith("prisma/generated/"))).toBe(false)
  })
})
