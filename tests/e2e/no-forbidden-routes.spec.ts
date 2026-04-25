import { expect, test } from "@playwright/test"

const forbiddenRoutes = [
  "/browse",
  "/providers",
  "/categories",
  "/messages",
  "/reviews",
  "/disputes",
]

test.describe("forbidden marketplace and arbitration routes", () => {
  for (const route of forbiddenRoutes) {
    test(`${route} is not available`, async ({ page }) => {
      const response = await page.goto(route)

      expect(response?.status()).toBeGreaterThanOrEqual(400)
    })
  }
})
