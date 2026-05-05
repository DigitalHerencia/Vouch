import { expect, test } from "@playwright/test"

test.describe("public marketing routes", () => {
  test("landing page loads without auth", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText(/commitment-backed payments/i)).toBeVisible()
  })

  test("pricing loads without auth", async ({ page }) => {
    await page.goto("/pricing")

    await expect(page.getByRole("heading", { name: /know the cost/i })).toBeVisible()
  })

  test("faq loads without auth", async ({ page }) => {
    await page.goto("/faq")

    await expect(page.getByRole("heading", { name: /precise answers/i })).toBeVisible()
  })

  test("legal pages load without auth", async ({ page }) => {
    await page.goto("/legal/terms")
    await expect(page.getByRole("heading", { name: /terms of service/i })).toBeVisible()

    await page.goto("/legal/privacy")
    await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible()
  })
})
