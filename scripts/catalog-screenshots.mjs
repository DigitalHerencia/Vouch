import { chromium, devices } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const outDir = path.resolve("output/screen-catalog")

const surfaces = [
  { id: "public-landing", label: "Public / Landing", path: "/" },
  { id: "public-pricing", label: "Public / Pricing", path: "/pricing" },
  { id: "public-faq", label: "Public / FAQ", path: "/faq" },
  { id: "public-terms", label: "Public / Legal / Terms", path: "/legal/terms" },
  { id: "public-privacy", label: "Public / Legal / Privacy", path: "/legal/privacy" },
  { id: "public-checkout-success", label: "Public / Checkout Success", path: "/checkout/success" },
  { id: "auth-sign-in", label: "Auth / Sign In", path: "/sign-in" },
  { id: "auth-sign-up", label: "Auth / Sign Up", path: "/sign-up" },
  {
    id: "auth-sign-in-return-vouches-new",
    label: "Auth / Sign In / Preserved Create Return",
    path: "/sign-in?return_to=%2Fvouches%2Fnew",
  },
  {
    id: "tenant-dashboard-unauthenticated",
    label: "Tenant / Dashboard / Unauthenticated Redirect",
    path: "/dashboard",
  },
  {
    id: "tenant-create-unauthenticated",
    label: "Tenant / Create Vouch / Unauthenticated Redirect",
    path: "/vouches/new",
  },
  {
    id: "tenant-detail-unauthenticated",
    label: "Tenant / Vouch Detail / Unauthenticated Redirect",
    path: "/vouches/catalog-placeholder",
  },
  { id: "system-not-found", label: "System / Not Found", path: "/catalog-not-found" },
]

const viewports = [
  { id: "desktop", label: "Desktop", options: { viewport: { width: 1440, height: 1200 } } },
  { id: "mobile", label: "Mobile", options: devices["Pixel 7"] },
]

function absoluteUrl(routePath) {
  return new URL(routePath, baseURL).toString()
}

function sanitize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const rows = []

for (const viewport of viewports) {
  const context = await browser.newContext(viewport.options)
  const page = await context.newPage()

  for (const surface of surfaces) {
    const fileName = `${viewport.id}__${sanitize(surface.id)}.png`
    const filePath = path.join(outDir, fileName)
    const response = await page.goto(absoluteUrl(surface.path), {
      waitUntil: "networkidle",
      timeout: 45_000,
    })
    await page.screenshot({ path: filePath, fullPage: true })
    rows.push({
      viewport: viewport.label,
      label: surface.label,
      path: surface.path,
      finalUrl: page.url(),
      status: response?.status() ?? "n/a",
      fileName,
    })
  }

  await context.close()
}

await browser.close()

const lines = [
  "# Vouch Screen Catalog",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Base URL: ${baseURL}`,
  "",
  "These screenshots catalog the route-level screens reachable without an authenticated Clerk browser session. Protected tenant routes are captured at their unauthenticated redirect state.",
  "",
  "| Viewport | Screen | Route | Final URL | HTTP | Screenshot |",
  "| --- | --- | --- | --- | --- | --- |",
  ...rows.map((row) =>
    [
      row.viewport,
      row.label,
      `\`${row.path}\``,
      `\`${row.finalUrl}\``,
      row.status,
      `[${row.fileName}](./${row.fileName})`,
    ].join(" | ")
  ),
  "",
]

await writeFile(path.join(outDir, "README.md"), lines.join("\n"))
console.log(`Wrote ${rows.length} screenshots to ${outDir}`)
