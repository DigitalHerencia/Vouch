# Vouch Implementation Instructions

## Operating mode

Treat Vouch as a production SaaS codebase with strict contracts.

Do not improvise product scope.

Do not add convenience surfaces that violate the product boundary.

Smallest correct surface wins.

## Before changing code

1. Identify the route, page, feature, action, fetcher, transaction, integration, schema, type, DTO, and component surface involved.
2. Read the relevant `.agents/contracts/*.yaml`.
3. Read the relevant `.agents/docs/*.md`.
4. Inspect existing repo code.
5. If code conflicts with contracts, contracts win.
6. If docs conflict with contracts, stop and report.

## Output rule

When asked for implementation code, output complete affected files.

Do not output snippets, partial patches, ellipses, pseudo-code, or summary-only implementation.

If a file changes, provide the whole file.

If blocked, provide the most complete compilable blocked-state file possible and state the exact missing dependency or context.

## App Router rule

Route pages stay thin.

Correct:

```txt
app page
-> Suspense if dynamic
-> page feature
-> skeleton
```

Incorrect:

```txt
app page
-> Prisma
-> Stripe SDK
-> domain mutation
-> DTO shaping
-> complex form logic
```

## Server feature rule

Server features may orchestrate fetchers and pass DTOs.

They may not mutate provider or database state directly.

## Client feature rule

Client features may handle:

```txt
drawer/dialog state
form state
transition state
optimistic display where safe
button interaction
copy/share behavior
```

Client features must not create truth.

## Form rule

Forms use:

```txt
React Hook Form
Zod
server actions
typed ActionResult
```

Client-side validation is UX only.

Server actions enforce truth.

## Read implementation pattern

For a protected read:

```txt
lib/fetchers/*
-> require active user
-> authorize access
-> use minimal select
-> map to DTO
-> set cache policy
-> return DTO
```

## Write implementation pattern

For a protected write:

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
-> return typed result or redirect
```

## Stripe implementation pattern

All Stripe calls live under:

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

Never finalize from browser return.

## Clerk implementation pattern

All Clerk auth access is centralized under:

```txt
lib/auth/*
```

All Vouch permission checks are centralized under:

```txt
lib/authz/*
```

Clerk session proves authentication.

Database state proves Vouch permissions.

## Confirmation implementation pattern

Confirmation action must enforce:

```txt
active user
participant authorization
open confirmation window
valid role
valid code derivation
no duplicate confirmation
server-side timestamp
offline payload validity if applicable
```

If both confirmations are valid inside the window, settlement evaluation may run.

If not, no settlement.

## Dashboard implementation pattern

Dashboard shows:

```txt
metric grid
vertical Vouch card column
callout panel
```

Dashboard must not become analytics, marketplace, messaging, reviews, disputes, or kanban.

## Vouch detail implementation pattern

Vouch detail is the canonical action surface.

It owns:

```txt
payment status
confirmation status
checkout link sharing
presence confirmation
archive
role-aware next action
safe timeline
```

Do not create route sprawl.

## File placement

Use these placements:

```txt
app/(tenant)/dashboard/page.tsx
features/dashboard/dashboard-page.tsx
features/dashboard/dashboard-page.client.tsx
components/dashboard/*

app/(tenant)/vouches/new/page.tsx
app/(tenant)/vouches/new/confirm/page.tsx
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

## Forbidden implementation patterns

Do not implement:

```txt
app/api/vouches/*
app/api/accounts/*
app/api/payment/setup/*
components with Prisma
components with Stripe SDK
components with Clerk server APIs
client fetch('/api/...') for app mutations
manual release button
force refund button
admin outcome editor
confirmation timestamp editor
dispute form
evidence upload
review/rating UI
marketplace cards
provider search
message thread
```

## Completion report

Final implementation report should contain only:

```txt
complete / not complete
files delivered or changed
validation run
validation result
blockers
```
