import { expect, test } from "@playwright/test"

test.describe("authenticated app route shells", () => {
  test("dashboard route renders a dashboard shell", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
  })

  test("setup route explains readiness", async ({ page }) => {
    await page.goto("/setup")

    await expect(page.getByText(/finish setup/i)).toBeVisible()
  })
})
