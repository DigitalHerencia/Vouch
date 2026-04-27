import { readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"
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

const forbiddenPathFragments = [
  `${sep}browse${sep}`,
  `${sep}providers${sep}`,
  `${sep}messages${sep}`,
  `${sep}reviews${sep}`,
  `${sep}ratings${sep}`,
  `${sep}categories${sep}`,
  `${sep}disputes${sep}`,
  `${sep}evidence${sep}`,
  `${sep}marketplace${sep}`,
  "provider-card",
  "public-profile",
  "review-card",
  "rating-stars",
  "message-thread",
  "chat-bubble",
  "category-filter",
  "featured-provider",
  "recommendation-card",
  "dispute-form",
  "evidence-uploader",
  "reputation-score",
]

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = join(directory, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      if (ignoredDirectories.has(entry)) return []
      return walk(absolutePath)
    }

    return [relative(root, absolutePath).toLowerCase()]
  })
}

describe("forbidden Vouch artifact names", () => {
  it("does not introduce marketplace, messaging, rating, review, or dispute files", () => {
    const files = walk(root)

    for (const fragment of forbiddenPathFragments) {
      expect(files.filter((file) => file.includes(fragment))).toEqual([])
    }
  })
})
