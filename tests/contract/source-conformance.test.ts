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

const sourceFilesToScan = ["app", "components", "features", "lib", "schemas", "types"]

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
  "/vouches/[vouchId]/confirm",
  "app/(tenant)/vouches/[vouchId]/confirm/",
  "app/(public)/vouches/",
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
  const content = stripScaffoldPathEchoes(readProjectFile(file)).toLowerCase()

  for (const value of values) {
    expect(content, `${context}: ${file} must not contain ${value}`).not.toContain(
      value.toLowerCase()
    )
  }
}

function extractConstDeclaration(content: string, declaration: string): string {
  const pattern = new RegExp(`export const ${declaration} = \\[[\\s\\S]*?\\] as const`, "m")
  return content.match(pattern)?.[0] ?? ""
}

function stripBoundaryDisclaimers(content: string): string {
  return content
    .split(/\r?\n/)
    .filter((line) => !/\b(?:no|not|does not|isn't|is not|never)\b/i.test(line))
    .join("\n")
}

function stripScaffoldPathEchoes(content: string): string {
  const lines: string[] = []
  let inImportBlock = false

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (/^import\b/i.test(trimmed)) {
      inImportBlock = !/\bfrom\s+["']/i.test(trimmed)
      continue
    }
    if (inImportBlock) {
      if (/\bfrom\s+["']/i.test(trimmed)) inImportBlock = false
      continue
    }
    if (/[\w/-]+\.(?:ts|tsx|md|json|ya?ml)\b/i.test(line)) continue
    lines.push(line)
  }

  return lines.join("\n")
}

function stripAllowedCompatibilityRoleAliases(file: string, content: string): string {
  let normalized = content

  if (file === "lib/vouch/constants.ts") {
    normalized = normalized.replace(
      /export const PAYMENT_ROLE_MAP = \{[\s\S]*?\} as const\s*/m,
      ""
    )
  }

  return normalized.replace(/\/\*\*[\s\S]*?compat[\s\S]*?\*\//gi, "").replace(/^.*compat.*$/gim, "")
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
      const content = stripBoundaryDisclaimers(
        stripScaffoldPathEchoes(readProjectFile(file))
      ).toLowerCase()

      for (const value of forbiddenProductTerms) {
        expect(content, `Forbidden product framing: ${file} must not contain ${value}`).not.toContain(
          value.toLowerCase()
        )
      }
    }
  })

  it("keeps obsolete Vouch lifecycle values out of canonical constants and schemas", () => {
    const constantsFile = "lib/vouch/constants.ts"
    if (existsSync(join(root, constantsFile))) {
      const vouchStatuses = extractConstDeclaration(
        readProjectFile(constantsFile),
        "VOUCH_STATUS_VALUES"
      ).toLowerCase()

      for (const value of obsoleteVouchStatusValues) {
        expect(
          vouchStatuses,
          `Obsolete VouchStatus value: ${constantsFile} VOUCH_STATUS_VALUES must not contain ${value}`
        ).not.toContain(value.toLowerCase())
      }
    }

    for (const file of ["schemas/vouch.ts", "types/vouch.ts"].filter((path) =>
      existsSync(join(root, path))
    )) {
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
      const content = stripAllowedCompatibilityRoleAliases(file, readProjectFile(file)).toLowerCase()

      for (const value of forbiddenParticipantRoles) {
        expect(
          content,
          `Forbidden canonical participant role: ${file} must not contain ${value}`
        ).not.toContain(value.toLowerCase())
      }
    }
  })

  it("keeps generated Prisma files untracked by source conformance checks", () => {
    const files = projectFiles()
    expect(files.some((file) => file.startsWith("prisma/generated/"))).toBe(false)
  })
})
