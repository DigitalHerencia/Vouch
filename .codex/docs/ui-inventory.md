# Vouch UI Inventory

Source date: 2026-05-16

This inventory is the UI source of truth for the current Vouch app surface. It follows the product rule: the Vouch object is the product, the dashboard is an index, and the Vouch detail page is the operating center.

## Approved Routes

Root:

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/loading.tsx`
- `app/not-found.tsx`
- `app/global-error.tsx`

Public:

- `app/(public)/layout.tsx`
- `app/(public)/loading.tsx`
- `app/(public)/error.tsx`
- `app/(public)/faq/page.tsx`
- `app/(public)/pricing/page.tsx`
- `app/(public)/legal/terms/page.tsx`
- `app/(public)/legal/privacy/page.tsx`
- `app/(public)/checkout/success/page.tsx`

Auth:

- `app/(auth)/layout.tsx`
- `app/(auth)/loading.tsx`
- `app/(auth)/error.tsx`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

Tenant:

- `app/(tenant)/layout.tsx`
- `app/(tenant)/loading.tsx`
- `app/(tenant)/error.tsx`
- `app/(tenant)/dashboard/page.tsx`
- `app/(tenant)/vouches/new/page.tsx`
- `app/(tenant)/vouches/new/confirm/page.tsx`
- `app/(tenant)/vouches/[vouchId]/page.tsx`

Provider webhooks:

- `app/api/clerk/webhooks/route.ts`
- `app/api/stripe/webhooks/route.ts`

## Feature Modules

- `features/auth/sign-in-page.tsx`
- `features/auth/sign-up-page.tsx`
- `features/dashboard/dashboard-page.tsx`
- `features/payments/checkout-success-page.tsx`
- `features/vouches/create-vouch-page.tsx`
- `features/vouches/create-vouch-page.client.tsx`
- `features/vouches/confirm-create-vouch-page.tsx`
- `features/vouches/vouch-detail-page.tsx`
- `features/vouches/vouch-detail-page.client.tsx`

`features/dashboard/dashboard-page.client.tsx` is not approved until dashboard needs client-only state.

## Shared Components

Shared components are the default for public, legal, pricing, and generic content structure:

- `components/shared/page-hero.tsx`
- `components/shared/section-intro.tsx`
- `components/shared/process-panel.tsx`
- `components/shared/metric-grid.tsx`
- `components/shared/card-grid.tsx`
- `components/shared/content-section-list.tsx`
- `components/shared/callout-panel.tsx`

## Vouch Components

Specialized Vouch components exist only for Vouch object state and protocol interactions:

- `components/vouches/vouch-card.tsx`
- `components/vouches/vouch-card-list.tsx`
- `components/vouches/vouch-detail-header.tsx`
- `components/vouches/vouch-terms-summary.tsx`
- `components/vouches/lifecycle-status-panel.tsx`
- `components/vouches/payment-status-panel.tsx`
- `components/vouches/confirmation-panel.tsx`
- `components/vouches/vouch-code-exchange-panel.tsx`
- `components/vouches/vouch-timeline-panel.tsx`
- `components/vouches/vouch-actions-panel.tsx`
- `components/vouches/protocol-drawer.tsx`
- `components/vouches/provider-redirect-drawer.tsx`
- `components/vouches/create-vouch-page-skeleton.tsx`
- `components/vouches/confirm-create-vouch-page-skeleton.tsx`
- `components/vouches/vouch-detail-page-skeleton.tsx`

## Content Modules

- `content/marketing.ts`
- `content/pricing.ts`
- `content/faq.ts`
- `content/legal.ts`
- `content/dashboard.ts`
- `content/vouches.ts`
- `content/auth.ts`
- `content/navigation.ts`

Components render content. Components do not author repeated product copy.

## UI Primitives

- `components/ui/accordion.tsx`
- `components/ui/alert.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/dialog.tsx`
- `components/ui/drawer.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/field.tsx`
- `components/ui/input.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/progress.tsx`
- `components/ui/select.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/sonner.tsx`
- `components/ui/textarea.tsx`

## Flow Map

Landing: `app/page.tsx` composes shared public components from `content/marketing.ts`.

Pricing: `app/(public)/pricing/page.tsx` explains fee timing, provider-hosted payment flow, and deterministic release through shared components.

FAQ, terms, privacy: reading-first pages using `PageHero`, `ContentSectionList`, and `CalloutPanel`.

Auth: sign-in/sign-up use custom forms and `AuthPageShell`. Auth collects account identity only; provider payment and identity readiness happen through hosted provider surfaces.

Dashboard: authenticated Vouch index using state-grouped `VouchCardList` sections.

Create Vouch: draft form collects only amount, appointment date/time, and confirmation window. Confirm create shows immutable terms, fee summary, disclaimer acceptance, and sends the merchant to hosted Stripe fee checkout.

Checkout success: provider return surface only. It never treats browser return as payment truth.

Vouch detail: one Vouch operating center for immutable terms, lifecycle state, provider/payment state, bilateral confirmation state, participant-safe timeline, and safe role-aware actions.

## Lifecycle States

Canonical Vouch lifecycle states:

- `draft`
- `committed`
- `sent`
- `accepted`
- `authorized`
- `confirmable`
- `completed`
- `expired`

Provider payment and settlement states stay separate from lifecycle states.

## Provider Boundary

Stripe-hosted surfaces own payment, payment method, identity, payout onboarding, connected account management, and payment authorization. Vouch stores safe provider references, statuses, timestamps, readiness flags, and audit-safe metadata only.
