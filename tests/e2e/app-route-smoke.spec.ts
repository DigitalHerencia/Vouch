import { expect, test } from "@playwright/test"

test.describe("authenticated app route shells", () => {
  test("dashboard route does not expose marketplace copy", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page.getByText(/browse providers/i)).toHaveCount(0)
    await expect(page.getByText(/marketplace/i)).toHaveCount(0)
  })

  test("setup route explains readiness", async ({ page }) => {
    await page.goto("/setup")

    await expect(page.getByText(/finish setup/i)).toBeVisible()
  })
})
