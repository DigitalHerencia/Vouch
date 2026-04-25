#Requires -Version 7.0

<#
.SYNOPSIS
  Scaffolds Vouch app route shells, feature stubs, component stubs, and shadcn/ui primitives.

.EXAMPLE
  pwsh ./scripts/scaffold-vouch-ui.ps1

.EXAMPLE
  pwsh ./scripts/scaffold-vouch-ui.ps1 -InstallShadcn

.EXAMPLE
  pwsh ./scripts/scaffold-vouch-ui.ps1 -InstallShadcn -Overwrite

.NOTES
  - Uses app/ as route-shell only.
  - Creates feature placeholders under features/.
  - Creates presentational component placeholders under components/.
  - Does not stub components/ui primitives; shadcn owns those files.
  - Uses sonner instead of legacy toast by default.
#>

param(
  [string]$Root = (Get-Location).Path,

  [switch]$InstallShadcn,

  [switch]$Overwrite,

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Skip {
  param([string]$Message)
  Write-Host "skip: $Message" -ForegroundColor DarkGray
}

function Ensure-Directory {
  param([string]$Path)

  if ($DryRun) {
    Write-Host "mkdir $Path"
    return
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    [System.IO.Directory]::CreateDirectory($Path) | Out-Null
  }
}

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $parent = Split-Path -Parent $Path
  Ensure-Directory -Path $parent

  if ((Test-Path -LiteralPath $Path) -and -not $Overwrite) {
    Write-Skip $Path
    return
  }

  if ($DryRun) {
    Write-Host "write $Path"
    return
  }

  Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
  Write-Host "wrote: $Path"
}

function To-PascalCase {
  param([string]$Value)

  $clean = $Value `
    -replace "\.client", "" `
    -replace "\.tsx", "" `
    -replace "\.ts", "" `
    -replace "\[", "" `
    -replace "\]", "" `
    -replace "\.\.\.", "" `
    -replace "[^a-zA-Z0-9]+", " "

  $parts = $clean.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)

  if ($parts.Count -eq 0) {
    return "GeneratedComponent"
  }

  return ($parts | ForEach-Object {
    if ($_.Length -eq 1) {
      $_.ToUpperInvariant()
    } else {
      $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1)
    }
  }) -join ""
}

function New-RoutePageContent {
  param([string]$Title)

  return @"
import { RoutePlaceholder } from "@/features/system/route-placeholder"

export default function Page() {
  return <RoutePlaceholder title="$Title" />
}
"@
}

function New-LoadingContent {
  return @"
import { RoutePlaceholder } from "@/features/system/route-placeholder"

export default function Loading() {
  return <RoutePlaceholder title="Loading" />
}
"@
}

function New-ErrorContent {
  return @"
"use client"

import { RoutePlaceholder } from "@/features/system/route-placeholder"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RoutePlaceholder
      title="Something went wrong"
      description={error.message}
      actionLabel="Try again"
      onAction={reset}
    />
  )
}
"@
}

function New-NotFoundContent {
  return @"
import { RoutePlaceholder } from "@/features/system/route-placeholder"

export default function NotFound() {
  return <RoutePlaceholder title="Not found" />
}
"@
}

function New-LayoutContent {
  param([string]$Name)

  return @"
export default function ${Name}Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
"@
}

function New-FeatureContent {
  param(
    [string]$FileName,
    [string]$RelativePath
  )

  $componentName = To-PascalCase -Value $FileName

  return @"
export function $componentName() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <p className="text-sm text-neutral-400">$RelativePath</p>
    </section>
  )
}

export default $componentName
"@
}

function New-ClientFeatureContent {
  param(
    [string]$FileName,
    [string]$RelativePath
  )

  $componentName = To-PascalCase -Value $FileName

  return @"
"use client"

export function $componentName() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <p className="text-sm text-neutral-400">$RelativePath</p>
    </section>
  )
}

export default $componentName
"@
}

function New-ComponentContent {
  param(
    [string]$FileName,
    [string]$RelativePath
  )

  $componentName = To-PascalCase -Value $FileName

  return @"
export interface ${componentName}Props {
  className?: string
}

export function $componentName({ className }: ${componentName}Props) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">$RelativePath</p>
    </div>
  )
}
"@
}

Write-Step "Scaffolding Vouch route shells, features, and components"

# -----------------------------
# App route files
# -----------------------------

$appFiles = @(
  "app/layout.tsx",
  "app/loading.tsx",
  "app/error.tsx",
  "app/global-error.tsx",
  "app/not-found.tsx",

  "app/(public)/layout.tsx",
  "app/(public)/page.tsx",
  "app/(public)/loading.tsx",
  "app/(public)/error.tsx",
  "app/(public)/how-it-works/page.tsx",
  "app/(public)/pricing/page.tsx",
  "app/(public)/faq/page.tsx",
  "app/(public)/legal/terms/page.tsx",
  "app/(public)/legal/privacy/page.tsx",
  "app/(public)/vouches/invite/[token]/page.tsx",
  "app/(public)/vouches/invite/[token]/loading.tsx",
  "app/(public)/vouches/invite/[token]/error.tsx",

  "app/(auth)/layout.tsx",
  "app/(auth)/sign-in/[[...sign-in]]/page.tsx",
  "app/(auth)/sign-up/[[...sign-up]]/page.tsx",
  "app/(auth)/auth/callback/page.tsx",
  "app/(auth)/auth/callback/loading.tsx",
  "app/(auth)/auth/error/page.tsx",
  "app/(auth)/auth/signed-out/page.tsx",

  "app/(app)/layout.tsx",
  "app/(app)/loading.tsx",
  "app/(app)/error.tsx",
  "app/(app)/not-found.tsx",
  "app/(app)/dashboard/page.tsx",
  "app/(app)/dashboard/loading.tsx",
  "app/(app)/dashboard/error.tsx",
  "app/(app)/setup/page.tsx",
  "app/(app)/setup/loading.tsx",
  "app/(app)/setup/error.tsx",
  "app/(app)/settings/page.tsx",
  "app/(app)/settings/loading.tsx",
  "app/(app)/settings/error.tsx",
  "app/(app)/settings/payment/page.tsx",
  "app/(app)/settings/payment/loading.tsx",
  "app/(app)/settings/payment/error.tsx",
  "app/(app)/settings/payout/page.tsx",
  "app/(app)/settings/payout/loading.tsx",
  "app/(app)/settings/payout/error.tsx",
  "app/(app)/settings/verification/page.tsx",
  "app/(app)/settings/verification/loading.tsx",
  "app/(app)/settings/verification/error.tsx",
  "app/(app)/vouches/page.tsx",
  "app/(app)/vouches/loading.tsx",
  "app/(app)/vouches/error.tsx",
  "app/(app)/vouches/new/page.tsx",
  "app/(app)/vouches/new/loading.tsx",
  "app/(app)/vouches/new/error.tsx",
  "app/(app)/vouches/[vouchId]/page.tsx",
  "app/(app)/vouches/[vouchId]/loading.tsx",
  "app/(app)/vouches/[vouchId]/error.tsx",
  "app/(app)/vouches/[vouchId]/not-found.tsx",
  "app/(app)/vouches/[vouchId]/confirm/page.tsx",
  "app/(app)/vouches/[vouchId]/confirm/loading.tsx",
  "app/(app)/vouches/[vouchId]/confirm/error.tsx",

  "app/(admin)/admin/layout.tsx",
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/loading.tsx",
  "app/(admin)/admin/error.tsx",
  "app/(admin)/admin/vouches/page.tsx",
  "app/(admin)/admin/vouches/loading.tsx",
  "app/(admin)/admin/vouches/error.tsx",
  "app/(admin)/admin/vouches/[vouchId]/page.tsx",
  "app/(admin)/admin/vouches/[vouchId]/loading.tsx",
  "app/(admin)/admin/vouches/[vouchId]/error.tsx",
  "app/(admin)/admin/vouches/[vouchId]/not-found.tsx",
  "app/(admin)/admin/users/page.tsx",
  "app/(admin)/admin/users/loading.tsx",
  "app/(admin)/admin/users/error.tsx",
  "app/(admin)/admin/users/[userId]/page.tsx",
  "app/(admin)/admin/users/[userId]/loading.tsx",
  "app/(admin)/admin/users/[userId]/error.tsx",
  "app/(admin)/admin/users/[userId]/not-found.tsx",
  "app/(admin)/admin/payments/page.tsx",
  "app/(admin)/admin/payments/loading.tsx",
  "app/(admin)/admin/payments/error.tsx",
  "app/(admin)/admin/payments/[paymentId]/page.tsx",
  "app/(admin)/admin/payments/[paymentId]/loading.tsx",
  "app/(admin)/admin/payments/[paymentId]/error.tsx",
  "app/(admin)/admin/payments/[paymentId]/not-found.tsx",
  "app/(admin)/admin/webhooks/page.tsx",
  "app/(admin)/admin/webhooks/loading.tsx",
  "app/(admin)/admin/webhooks/error.tsx",
  "app/(admin)/admin/webhooks/[eventId]/page.tsx",
  "app/(admin)/admin/webhooks/[eventId]/loading.tsx",
  "app/(admin)/admin/webhooks/[eventId]/error.tsx",
  "app/(admin)/admin/webhooks/[eventId]/not-found.tsx",
  "app/(admin)/admin/audit/page.tsx",
  "app/(admin)/admin/audit/loading.tsx",
  "app/(admin)/admin/audit/error.tsx",
  "app/(admin)/admin/audit/[eventId]/page.tsx",
  "app/(admin)/admin/audit/[eventId]/loading.tsx",
  "app/(admin)/admin/audit/[eventId]/error.tsx",
  "app/(admin)/admin/audit/[eventId]/not-found.tsx",

  "app/api/webhooks/stripe/route.ts",
  "app/api/webhooks/clerk/route.ts"
)

foreach ($file in $appFiles) {
  $fullPath = Join-Path $Root $file

  if ($file -eq "app/layout.tsx") {
    Write-TextFile -Path $fullPath -Content @"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vouch",
  description: "Commitment-backed payments for appointments and in-person agreements.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
"@
    continue
  }

  if ($file -like "*/layout.tsx") {
    $name = To-PascalCase -Value (($file -replace "app/", "") -replace "/layout.tsx", "")
    Write-TextFile -Path $fullPath -Content (New-LayoutContent -Name $name)
    continue
  }

  if ($file -like "*/loading.tsx" -or $file -eq "app/loading.tsx") {
    Write-TextFile -Path $fullPath -Content (New-LoadingContent)
    continue
  }

  if ($file -like "*/error.tsx" -or $file -eq "app/error.tsx" -or $file -eq "app/global-error.tsx") {
    Write-TextFile -Path $fullPath -Content (New-ErrorContent)
    continue
  }

  if ($file -like "*/not-found.tsx" -or $file -eq "app/not-found.tsx") {
    Write-TextFile -Path $fullPath -Content (New-NotFoundContent)
    continue
  }

  if ($file -like "app/api/*/route.ts") {
    Write-TextFile -Path $fullPath -Content @"
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Webhook handler not implemented" },
    { status: 501 }
  )
}
"@
    continue
  }

  if ($file -like "*/page.tsx") {
    $title = $file `
      -replace "^app/", "" `
      -replace "/page\.tsx$", "" `
      -replace "\(public\)/", "" `
      -replace "\(auth\)/", "" `
      -replace "\(app\)/", "" `
      -replace "\(admin\)/", "" `
      -replace "/", " / "

    Write-TextFile -Path $fullPath -Content (New-RoutePageContent -Title $title)
    continue
  }
}

# -----------------------------
# Feature stubs
# -----------------------------

$featureFiles = @(
  "features/system/route-placeholder.tsx",

  "features/marketing/landing-page.tsx",
  "features/marketing/how-it-works-page.tsx",
  "features/marketing/pricing-page.tsx",
  "features/marketing/faq-page.tsx",
  "features/marketing/legal-page.tsx",
  "features/marketing/sections/marketing-hero.tsx",
  "features/marketing/sections/vouch-process-panel.tsx",
  "features/marketing/sections/use-cases-section.tsx",
  "features/marketing/sections/pricing-summary-section.tsx",
  "features/marketing/sections/trust-and-neutrality-section.tsx",
  "features/marketing/sections/faq-section.tsx",
  "features/marketing/sections/final-cta-section.tsx",

  "features/auth/sign-in-page.tsx",
  "features/auth/sign-up-page.tsx",
  "features/auth/auth-callback-page.tsx",
  "features/auth/auth-error-page.tsx",
  "features/auth/signed-out-page.tsx",

  "features/setup/setup-page.tsx",
  "features/setup/setup-checklist.tsx",
  "features/setup/setup-progress-panel.tsx",
  "features/setup/setup-blocked-panel.tsx",
  "features/setup/setup-return-context-banner.tsx",
  "features/setup/terms-acceptance-panel.tsx",
  "features/setup/terms-acceptance-dialog.client.tsx",

  "features/settings/account-settings-page.tsx",
  "features/settings/payment-settings-page.tsx",
  "features/settings/payout-settings-page.tsx",
  "features/settings/verification-settings-page.tsx",
  "features/settings/sections/profile-basics-section.tsx",
  "features/settings/sections/verification-status-section.tsx",
  "features/settings/sections/payment-readiness-section.tsx",
  "features/settings/sections/payout-readiness-section.tsx",
  "features/settings/sections/terms-status-section.tsx",
  "features/settings/sections/account-security-section.tsx",

  "features/payments/payment-setup-page.tsx",
  "features/payments/payout-setup-page.tsx",
  "features/payments/payment-provider-redirect-state.tsx",
  "features/payments/payout-provider-redirect-state.tsx",
  "features/payments/payment-method-ready-state.tsx",
  "features/payments/payment-method-failed-state.tsx",
  "features/payments/payout-ready-state.tsx",
  "features/payments/payout-restricted-state.tsx",

  "features/dashboard/dashboard-page.tsx",
  "features/dashboard/dashboard-content.tsx",
  "features/dashboard/dashboard-empty-state.tsx",
  "features/dashboard/dashboard-loading-state.tsx",
  "features/dashboard/dashboard-error-state.tsx",
  "features/dashboard/sections/action-required-section.tsx",
  "features/dashboard/sections/active-vouches-section.tsx",
  "features/dashboard/sections/pending-vouches-section.tsx",
  "features/dashboard/sections/completed-vouches-section.tsx",
  "features/dashboard/sections/expired-refunded-section.tsx",
  "features/dashboard/sections/setup-progress-card.tsx",
  "features/dashboard/sections/how-vouch-works-card.tsx",

  "features/vouches/list/vouch-list-page.tsx",
  "features/vouches/list/vouch-list-content.tsx",
  "features/vouches/list/vouch-list-filters.client.tsx",
  "features/vouches/list/vouch-list-empty-state.tsx",
  "features/vouches/list/vouch-list-loading-state.tsx",

  "features/vouches/create/create-vouch-page.tsx",
  "features/vouches/create/create-vouch-form.client.tsx",
  "features/vouches/create/create-vouch-review.client.tsx",
  "features/vouches/create/create-vouch-blocked-state.tsx",
  "features/vouches/create/create-vouch-success-state.tsx",
  "features/vouches/create/create-vouch-payment-processing-state.tsx",
  "features/vouches/create/create-vouch-payment-failed-state.tsx",
  "features/vouches/create/steps/amount-step.tsx",
  "features/vouches/create/steps/meeting-window-step.tsx",
  "features/vouches/create/steps/recipient-step.tsx",
  "features/vouches/create/steps/details-step.tsx",
  "features/vouches/create/steps/review-step.tsx",
  "features/vouches/create/steps/fee-breakdown-step.tsx",
  "features/vouches/create/steps/terms-acknowledgement-step.tsx",

  "features/vouches/invite/invite-landing-page.tsx",
  "features/vouches/invite/invite-invalid-state.tsx",
  "features/vouches/invite/invite-expired-state.tsx",
  "features/vouches/invite/invite-already-accepted-state.tsx",
  "features/vouches/invite/accept-vouch-page.tsx",
  "features/vouches/invite/accept-vouch-review-panel.tsx",
  "features/vouches/invite/accept-vouch-setup-blocked-state.tsx",
  "features/vouches/invite/accept-vouch-payout-required-state.tsx",
  "features/vouches/invite/accept-vouch-terms-required-state.tsx",
  "features/vouches/invite/accept-vouch-confirmation-dialog.client.tsx",
  "features/vouches/invite/decline-vouch-dialog.client.tsx",
  "features/vouches/invite/accept-vouch-success-state.tsx",
  "features/vouches/invite/decline-vouch-success-state.tsx",
  "features/vouches/invite/self-acceptance-denied-state.tsx",

  "features/vouches/detail/vouch-detail-page.tsx",
  "features/vouches/detail/vouch-detail-pending-payer.tsx",
  "features/vouches/detail/vouch-detail-pending-invite-sent.tsx",
  "features/vouches/detail/vouch-detail-active-before-window.tsx",
  "features/vouches/detail/vouch-detail-active-window-open.tsx",
  "features/vouches/detail/vouch-detail-payer-confirmed.tsx",
  "features/vouches/detail/vouch-detail-payee-confirmed.tsx",
  "features/vouches/detail/vouch-detail-processing-release.tsx",
  "features/vouches/detail/vouch-detail-completed.tsx",
  "features/vouches/detail/vouch-detail-expired.tsx",
  "features/vouches/detail/vouch-detail-refunded.tsx",
  "features/vouches/detail/vouch-detail-failed-payment.tsx",
  "features/vouches/detail/vouch-detail-failed-release.tsx",
  "features/vouches/detail/vouch-detail-failed-refund.tsx",
  "features/vouches/detail/vouch-detail-unauthorized-state.tsx",
  "features/vouches/detail/vouch-detail-loading-state.tsx",

  "features/vouches/confirm/confirm-presence-page.tsx",
  "features/vouches/confirm/confirm-presence-payer.tsx",
  "features/vouches/confirm/confirm-presence-payee.tsx",
  "features/vouches/confirm/confirm-before-window-state.tsx",
  "features/vouches/confirm/confirm-window-open-state.tsx",
  "features/vouches/confirm/confirm-already-confirmed-state.tsx",
  "features/vouches/confirm/confirm-waiting-for-other-party-state.tsx",
  "features/vouches/confirm/confirm-both-confirmed-success-state.tsx",
  "features/vouches/confirm/confirm-window-closed-state.tsx",
  "features/vouches/confirm/confirm-duplicate-error-state.tsx",
  "features/vouches/confirm/confirm-unauthorized-state.tsx",
  "features/vouches/confirm/confirm-provider-failure-state.tsx",

  "features/vouches/share/share-vouch-panel.tsx",
  "features/vouches/share/invite-link-card.tsx",
  "features/vouches/share/send-invitation-card.client.tsx",
  "features/vouches/share/other-share-methods.tsx",
  "features/vouches/share/copy-invite-link.client.tsx",

  "features/admin/admin-dashboard-page.tsx",
  "features/admin/vouches/admin-vouch-list-page.tsx",
  "features/admin/vouches/admin-vouch-detail-page.tsx",
  "features/admin/vouches/admin-vouch-failure-heavy-state.tsx",
  "features/admin/vouches/admin-vouch-safe-retry-dialog.client.tsx",
  "features/admin/vouches/admin-vouch-safe-retry-result-state.tsx",
  "features/admin/users/admin-users-page.tsx",
  "features/admin/users/admin-user-detail-page.tsx",
  "features/admin/payments/admin-payments-page.tsx",
  "features/admin/payments/admin-payment-detail-page.tsx",
  "features/admin/webhooks/admin-webhook-events-page.tsx",
  "features/admin/webhooks/admin-webhook-event-detail-page.tsx",
  "features/admin/audit/admin-audit-log-page.tsx",
  "features/admin/audit/admin-audit-event-detail-page.tsx",
  "features/admin/states/admin-unauthorized-state.tsx",

  "features/system/global-loading-shell.tsx",
  "features/system/route-loading-skeleton.tsx",
  "features/system/global-error-view.tsx",
  "features/system/protected-route-unauthorized.tsx",
  "features/system/entity-not-found.tsx",
  "features/system/server-action-failure-pattern.tsx",
  "features/system/payment-provider-unavailable.tsx",
  "features/system/degraded-service-banner.tsx"
)

foreach ($file in $featureFiles) {
  $fullPath = Join-Path $Root $file

  if ($file -eq "features/system/route-placeholder.tsx") {
    Write-TextFile -Path $fullPath -Content @"
"use client"

export interface RoutePlaceholderProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function RoutePlaceholder({
  title,
  description = "Stub route shell. Wire this to the matching feature implementation.",
  actionLabel,
  onAction,
}: RoutePlaceholderProps) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-neutral-500">Vouch</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">{description}</p>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 w-fit rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-100"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  )
}
"@
    continue
  }

  if ($file -like "*.client.tsx") {
    Write-TextFile -Path $fullPath -Content (New-ClientFeatureContent -FileName (Split-Path -Leaf $file) -RelativePath $file)
  } else {
    Write-TextFile -Path $fullPath -Content (New-FeatureContent -FileName (Split-Path -Leaf $file) -RelativePath $file)
  }
}

# -----------------------------
# Presentational component stubs
# -----------------------------

$componentFiles = @(
  "components/brand/wordmark.tsx",
  "components/brand/verification-mark.tsx",
  "components/brand/logo-lockup.tsx",

  "components/layout/app-shell.tsx",
  "components/layout/app-header.tsx",
  "components/layout/app-sidebar.tsx",
  "components/layout/app-mobile-header.tsx",
  "components/layout/app-mobile-bottom-nav.tsx",
  "components/layout/public-header.tsx",
  "components/layout/public-footer.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/page-header.tsx",
  "components/layout/page-container.tsx",
  "components/layout/split-page-layout.tsx",
  "components/layout/two-column-layout.tsx",
  "components/layout/back-link.tsx",
  "components/layout/help-footer.tsx",

  "components/navigation/nav-link.tsx",
  "components/navigation/nav-section.tsx",
  "components/navigation/user-menu.tsx",
  "components/navigation/mobile-menu.tsx",
  "components/navigation/breadcrumb-link.tsx",

  "components/feedback/status-badge.tsx",
  "components/feedback/status-dot.tsx",
  "components/feedback/inline-alert.tsx",
  "components/feedback/empty-state.tsx",
  "components/feedback/error-state.tsx",
  "components/feedback/loading-state.tsx",
  "components/feedback/toast-message.tsx",
  "components/feedback/countdown.tsx",
  "components/feedback/progress-meter.tsx",
  "components/feedback/step-indicator.tsx",

  "components/forms/field-group.tsx",
  "components/forms/amount-input.tsx",
  "components/forms/date-input.tsx",
  "components/forms/time-select.tsx",
  "components/forms/email-input.tsx",
  "components/forms/terms-checkbox.tsx",
  "components/forms/submit-button.tsx",
  "components/forms/form-error.tsx",
  "components/forms/form-section.tsx",

  "components/marketing/process-step-card.tsx",
  "components/marketing/metric-tile.tsx",
  "components/marketing/use-case-card.tsx",
  "components/marketing/pricing-card.tsx",
  "components/marketing/faq-item.tsx",
  "components/marketing/principle-card.tsx",

  "components/dashboard/dashboard-section.tsx",
  "components/dashboard/dashboard-card.tsx",
  "components/dashboard/action-required-card.tsx",
  "components/dashboard/setup-progress-card.tsx",
  "components/dashboard/vouch-summary-row.tsx",

  "components/vouches/vouch-card.tsx",
  "components/vouches/vouch-list-row.tsx",
  "components/vouches/vouch-status-badge.tsx",
  "components/vouches/vouch-amount.tsx",
  "components/vouches/vouch-deadline.tsx",
  "components/vouches/vouch-id-pill.tsx",
  "components/vouches/vouch-party-row.tsx",
  "components/vouches/vouch-window-summary.tsx",
  "components/vouches/next-action-button.tsx",

  "components/vouches/detail/vouch-detail-header.tsx",
  "components/vouches/detail/vouch-summary-panel.tsx",
  "components/vouches/detail/confirmation-status-panel.tsx",
  "components/vouches/detail/confirmation-window-panel.tsx",
  "components/vouches/detail/payment-summary-panel.tsx",
  "components/vouches/detail/timeline-panel.tsx",
  "components/vouches/detail/what-happens-next-panel.tsx",
  "components/vouches/detail/share-vouch-actions.tsx",

  "components/vouches/confirm/confirmation-progress.tsx",
  "components/vouches/confirm/confirmation-party-node.tsx",
  "components/vouches/confirm/confirm-presence-panel.tsx",
  "components/vouches/confirm/confirmation-rule-card.tsx",

  "components/vouches/create/create-vouch-summary.tsx",
  "components/vouches/create/fee-breakdown.tsx",
  "components/vouches/create/recipient-method-selector.tsx",
  "components/vouches/create/share-link-toggle-row.tsx",
  "components/vouches/create/review-before-commit-card.tsx",

  "components/vouches/invite/invite-summary-card.tsx",
  "components/vouches/invite/accept-requirements-list.tsx",
  "components/vouches/invite/decline-action.tsx",

  "components/setup/setup-checklist-card.tsx",
  "components/setup/setup-checklist-item.tsx",
  "components/setup/verification-status-card.tsx",
  "components/setup/payment-readiness-card.tsx",
  "components/setup/payout-readiness-card.tsx",
  "components/setup/terms-status-card.tsx",
  "components/setup/blocked-requirement-card.tsx",

  "components/payments/payment-summary.tsx",
  "components/payments/payment-status-card.tsx",
  "components/payments/payout-status-card.tsx",
  "components/payments/provider-redirect-card.tsx",
  "components/payments/fee-line-item.tsx",
  "components/payments/refund-status-card.tsx",

  "components/admin/admin-metric-card.tsx",
  "components/admin/admin-status-filter.tsx",
  "components/admin/admin-vouch-table.tsx",
  "components/admin/admin-user-table.tsx",
  "components/admin/admin-payment-table.tsx",
  "components/admin/admin-webhook-table.tsx",
  "components/admin/admin-audit-table.tsx",
  "components/admin/admin-timeline.tsx",
  "components/admin/safe-retry-button.tsx",
  "components/admin/redacted-provider-reference.tsx"
)

foreach ($file in $componentFiles) {
  $fullPath = Join-Path $Root $file
  Write-TextFile -Path $fullPath -Content (New-ComponentContent -FileName (Split-Path -Leaf $file) -RelativePath $file)
}

# Create components/ui directory but do not stub shadcn primitives.
Ensure-Directory -Path (Join-Path $Root "components/ui")

# -----------------------------
# shadcn/ui install
# -----------------------------

if ($InstallShadcn) {
  Write-Step "Initializing shadcn/ui"

  $initArgs = @(
    "dlx",
    "shadcn@latest",
    "init",
    "--yes",
    "--defaults",
    "--force",
    "--cwd",
    $Root,
    "--css-variables"
  )

  Write-Host "pnpm $($initArgs -join ' ')" -ForegroundColor Yellow

  if (-not $DryRun) {
    pnpm @initArgs
  }

  Write-Step "Adding shadcn/ui primitives"

  $primitives = @(
    "accordion",
    "alert",
    "alert-dialog",
    "avatar",
    "badge",
    "button",
    "calendar",
    "card",
    "checkbox",
    "collapsible",
    "command",
    "dialog",
    "drawer",
    "dropdown-menu",
    "form",
    "input",
    "input-otp",
    "label",
    "popover",
    "progress",
    "radio-group",
    "scroll-area",
    "select",
    "separator",
    "sheet",
    "skeleton",
    "sonner",
    "switch",
    "table",
    "tabs",
    "textarea",
    "toggle",
    "tooltip"
  )

  $addArgs = @(
    "dlx",
    "shadcn@latest",
    "add"
  ) + $primitives + @(
    "--yes",
    "--overwrite",
    "--cwd",
    $Root
  )

  Write-Host "pnpm $($addArgs -join ' ')" -ForegroundColor Yellow

  if (-not $DryRun) {
    pnpm @addArgs
  }

  Write-Step "shadcn/ui primitive install complete"
} else {
  Write-Step "shadcn/ui install skipped"
  Write-Host "Run with -InstallShadcn to execute:" -ForegroundColor Yellow
  Write-Host "pnpm dlx shadcn@latest init --yes --defaults --force --cwd `"$Root`" --css-variables"
  Write-Host "pnpm dlx shadcn@latest add accordion alert alert-dialog avatar badge button calendar card checkbox collapsible command dialog drawer dropdown-menu form input input-otp label popover progress radio-group scroll-area select separator sheet skeleton sonner switch table tabs textarea toggle tooltip --yes --overwrite --cwd `"$Root`""
}

Write-Step "Done"
