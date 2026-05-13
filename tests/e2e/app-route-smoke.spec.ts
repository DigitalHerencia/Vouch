import { expect, test } from "@playwright/test"

test.describe("authenticated app route shells", () => {
  test("dashboard route is part of the contracted app surface", async ({ page }) => {
    const response = await page.goto("/dashboard")
    const status = response?.status()

    expect(status).toBeDefined()
    expect(status).toBeGreaterThanOrEqual(200)
    expect(status).toBeLessThanOrEqual(399)
  })

  test("create route is part of the contracted app surface", async ({ page }) => {
    const response = await page.goto("/vouches/new")
    const status = response?.status()

    expect(status).toBeDefined()
    expect(status).toBeGreaterThanOrEqual(200)
    expect(status).toBeLessThanOrEqual(399)
  })
})
