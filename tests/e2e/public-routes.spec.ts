import { expect, test } from "@playwright/test"

test.describe("public marketing routes", () => {
  test("landing page loads without auth", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText(/commitment-backed payments/i)).toBeVisible()
  })

  test("how it works loads without auth", async ({ page }) => {
    await page.goto("/how-it-works")

    await expect(page.getByText(/both confirm/i)).toBeVisible()
  })

  test("faq states Vouch is not a marketplace", async ({ page }) => {
    await page.goto("/faq")

    await expect(page.getByText(/not a marketplace/i)).toBeVisible()
  })
})
