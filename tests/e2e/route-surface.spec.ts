import { expect, test } from "@playwright/test"

const routeSmokeCases = [
  { path: "/", expectedStatus: 200 },
  { path: "/dashboard", expectedMinimumStatus: 200, expectedMaximumStatus: 399 },
  { path: "/vouches/new", expectedMinimumStatus: 200, expectedMaximumStatus: 399 },
]

test.describe("contracted route surface", () => {
  for (const route of routeSmokeCases) {
    test(`${route.path} responds`, async ({ page }) => {
      const response = await page.goto(route.path)
      const status = response?.status()

      expect(status).toBeDefined()

      if (route.expectedStatus) {
        expect(status).toBe(route.expectedStatus)
      } else {
        expect(status).toBeGreaterThanOrEqual(route.expectedMinimumStatus ?? 200)
        expect(status).toBeLessThanOrEqual(route.expectedMaximumStatus ?? 399)
      }
    })
  }
})
