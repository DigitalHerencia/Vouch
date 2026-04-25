import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const forbiddenPathFragments = [
  "provider-card",
  "public-profile",
  "review",
  "rating",
  "message-thread",
  "chat",
  "category-filter",
  "featured-provider",
  "recommendation",
  "dispute",
  "evidence",
  "reputation",
]

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      if (["node_modules", ".next", "coverage", "playwright-report", "test-results", ".git"].includes(entry)) {
        return []
      }

      return listFiles(path)
    }

    return [path]
  })
}

describe("forbidden Vouch artifact names", () => {
  it("does not introduce marketplace, messaging, review, or dispute files", () => {
    const files = listFiles(process.cwd()).map((path) => path.toLowerCase())

    for (const fragment of forbiddenPathFragments) {
      expect(files.filter((file) => file.includes(fragment))).toEqual([])
    }
  })
})
