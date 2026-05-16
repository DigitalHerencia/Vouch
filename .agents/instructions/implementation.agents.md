# Vouch Implementation Instructions

## Operating Mode

Treat Vouch as a production SaaS codebase with strict source-of-truth contracts.

Do not improvise product scope.

Do not add convenience surfaces that violate the Vouch product boundary.

Smallest correct surface wins.

Vouch is a narrow commitment-backed payment coordination system.

Vouch is not:

- marketplace
- broker
- scheduler
- messaging app
- review/rating system
- dispute-resolution system
- escrow provider
- discovery platform
- admin arbitration surface

## Source Order

Use this authority order:

1. `.agents/contracts/*.yaml`
2. `.agents/docs/*.md`
3. `.agents/instructions/*.agents.md`
4. existing repo code
5. agent judgment

If code conflicts with contracts, contracts win.

If docs conflict with contracts, stop and report.

If instructions conflict with contracts, contracts win.

Do not invent behavior to resolve contradictions.

## Before Changing Code

Before changing any file:

1. Identify the smallest surface of change.
2. Identify affected route/page/feature/action/fetcher/transaction/integration/schema/type/DTO/component.
3. Read relevant contracts.
4. Read relevant docs.
5. Inspect existing repo code.
6. Make the smallest conforming change.
7. Output complete affected files.

## Output Rule

When asked for implementation code:

- output complete affected files
- no snippets
- no partial patches
- no ellipses
- no pseudo-code
- no summary-only implementation

If a file changes, provide the whole file.

If blocked, provide the most complete compilable blocked-state file possible and state the exact missing context.

## App Router Rule

Route files stay thin.

Allowed in `app/**` route files:

- metadata
- params/searchParams handoff
- redirects when required
- Suspense boundary
- feature composition
- skeleton fallback
- static public page assembly

Forbidden in `app/**` route files:

- Prisma imports
- Stripe SDK imports
- domain mutations
- business transactions
- protected DTO shaping
- settlement logic
- provider reconciliation
- complex form logic

Correct pattern:

```txt
app page
-> Suspense if dynamic
-> page feature
-> skeleton
```

## Feature Rule

Server features may:

- orchestrate fetchers
- pass DTOs
- perform role-aware composition
- hand actions to client components

Server features must not:

- mutate provider state
- mutate database state directly
- call Prisma directly
- call Stripe SDKs directly

Client features may handle:

- drawer/dialog state
- form state
- transition state
- optimistic display where safe
- button interactions
- copy/share behavior

Client features must not create truth.

## Component Rule

Components may:

- render DTOs
- render content module data
- render presentational layout
- render buttons, panels, cards, badges, drawers, summaries

Components must not:

- call Prisma
- call Stripe SDKs
- call Clerk server APIs
- perform protected fetching
- perform domain mutations
- decide settlement
- own authorization truth
- own confirmation truth
- hard-code repeated long-form copy

## Read Pattern

Protected reads go through fetchers.

```txt
lib/fetchers/*
-> require active user
-> authorize access
-> use minimal select
-> map DTO
-> declare cache policy
-> return transport-safe data
```

Fetchers must not mutate state.

Fetchers must not return raw Prisma, Stripe, Clerk, webhook, identity, card, or bank objects.

## Write Pattern

Protected writes go through server actions.

```txt
lib/actions/*
-> require active user
-> authorize action
-> parse input with Zod
-> retrieve provider state if needed
-> call integration if needed
-> call transaction helper
-> write audit event
-> revalidate
-> return typed ActionResult or redirect
```

Server actions must not trust client state for:

- confirmation
- payment
- settlement
- readiness
- role
- fee math

## Stripe Pattern

All Stripe SDK calls live under:

```txt
lib/integrations/stripe/*
```

Before settlement-critical operations:

```txt
retrieve current PaymentIntent
compare provider state to local workflow state
apply only valid forward movement
use durable idempotency key
persist normalized provider result
write audit event
```

Never capture, cancel, void, or refund from stale local state alone.

Never finalize payment state from browser return.

Never use direct charges as canonical Vouch flow.

Never use invoice/product/price catalog flows for individual Vouches.

Vouch uses manual-capture PaymentIntents for Vouch payment authorization.

Stripe owns payment truth.

Vouch owns workflow truth.

## Clerk Pattern

All Clerk authentication access is centralized under:

```txt
lib/auth/*
```

All Vouch permission checks are centralized under:

```txt
lib/authz/*
```

Clerk session proves authentication.

Database state proves Vouch permissions.

Clerk must not decide:

- Vouch participation
- payment readiness
- payout readiness
- settlement
- confirmation validity
- Vouch role by metadata alone

The Clerk webhook handler must remain a webhook handler.

Do not rename or reframe it away from webhook-handler semantics.

## Confirmation Pattern

Confirmation actions must enforce:

- active user
- participant authorization
- open confirmation window
- valid role
- valid code derivation
- no duplicate confirmation
- server-side timestamp
- offline payload validity if applicable

One-sided confirmation never releases funds.

Late confirmation never releases funds.

Manual/system/support confirmation must not exist.

GPS is not settlement truth.

Screenshots/evidence must not influence settlement.

If both confirmations are valid inside the window, settlement evaluation may run.

If not, no settlement.

## Dashboard Pattern

Dashboard shows:

- status orientation
- Vouch card list
- next action
- bottom callout

Dashboard must not become:

- analytics dashboard
- marketplace feed
- messaging inbox
- review surface
- dispute panel
- kanban board
- provider discovery page

## Vouch Detail Pattern

Vouch detail is the canonical action surface.

It owns:

- payment status
- confirmation status
- checkout link sharing
- presence confirmation
- archive action
- role-aware next action
- safe timeline

Do not create route sprawl for sub-actions.

Use drawers or inline panels for protocol actions.

## Approved User-Facing Pages

Public:

```txt
/
 /pricing
/faq
/legal/terms
/legal/privacy
/checkout/success
```

Auth:

```txt
/sign-in
/sign-up
```

Tenant:

```txt
/dashboard
/vouches/new
/vouches/[vouchId]
```

External provider surfaces are not Vouch pages.

## Approved API Routes

Only provider webhook routes are allowed:

```txt
app/api/clerk/webhooks/route.ts
app/api/stripe/webhooks/route.ts
```

Internal app mutations must not use API routes.

Forbidden:

```txt
app/api/vouches/*
app/api/accounts/*
app/api/payment/setup/*
app/api/payout/setup/*
app/api/admin/*
```

## File Placement

Use these placements:

```txt
app/(tenant)/dashboard/page.tsx
features/dashboard/dashboard-page.tsx
features/dashboard/dashboard-page.client.tsx
components/dashboard/*

app/(tenant)/vouches/new/page.tsx
app/(tenant)/vouches/[vouchId]/page.tsx
features/vouches/*
components/vouches/*
components/forms/*

lib/actions/vouchActions.ts
lib/actions/paymentActions.ts
lib/actions/authActions.ts

lib/fetchers/vouchFetchers.ts
lib/fetchers/paymentFetchers.ts
lib/fetchers/authFetchers.ts
lib/fetchers/dashboardFetchers.ts

lib/db/selects/*
lib/db/transactions/*
lib/dto/*
lib/integrations/stripe/*
lib/auth/*
lib/authz/*
lib/vouch/*

schemas/*
types/*
```

## Design-System Rule

Every UI change must follow the Vouch design system:

- dark operational SaaS
- brutalist structure
- zero-radius panels
- high contrast
- black/neutral foundation
- restrained blue accent
- uppercase display typography
- dense intentional spacing
- bordered black/55 panels
- mobile-first layouts
- status text not color alone

Do not introduce soft consumer marketplace UI patterns.

## Forbidden Implementation Patterns

Do not implement:

- manual release button
- force refund button
- manual payout button
- admin outcome editor
- confirmation timestamp editor
- dispute form
- evidence upload
- review/rating UI
- marketplace cards
- provider search
- message thread
- public profiles
- service listings
- categories
- browse/search/discovery

## Completion Report

Final implementation report must contain only:

```txt
STATUS: COMPLETE | NOT COMPLETE

FILES DELIVERED:
- path
- path

VALIDATION:
- command: PASS | FAIL | NOT RUN

BLOCKERS:
- none
```
