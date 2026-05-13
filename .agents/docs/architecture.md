# Vouch Architecture

## Layer contract

Vouch is a production SaaS codebase with strict boundaries.

## Route layer

`app/**` is route shell only.

Allowed:

```txt
route segments
layouts
metadata
loading/error/not-found boundaries
thin page.tsx files
Suspense wrappers
redirects
params/searchParams handoff
one page-level feature component
external provider webhook route handlers
```

Forbidden:

```txt
Prisma
Stripe SDK
provider business logic
Clerk domain logic
authz enforcement
DTO shaping
domain mutation
settlement logic
webhook reconciliation
complex forms
large hard-coded copy blocks
```

## Feature layer

`features/**` owns page-level orchestration.

Feature modules may:

```txt
call fetchers from server features
pass DTOs into UI
wire server actions into forms
coordinate Suspense boundaries
coordinate role-aware page branches
coordinate drawers/dialogs/forms
hold client-only state in .client.tsx files
```

Feature modules must not:

```txt
query Prisma
call Stripe SDKs directly
perform provider reconciliation
own reusable UI primitives
become generic component libraries
```

## Component layer

`components/**` is pure reusable UI.

Components may:

```txt
render DTOs
render forms
render panels/cards/buttons
format labels from props
emit server-action form submissions
use client state for UI interaction
```

Components must not:

```txt
call Prisma
call protected fetchers
call Stripe SDK
call Clerk server APIs
perform authz
mutate domain state directly
invent hidden business rules
```

## UI primitives

`components/ui/**` contains low-level shadcn/Base UI primitives only.

No domain semantics.

No protected fetching.

No Vouch workflow rules.

## Reads

Reads go through:

```txt
lib/fetchers/*
```

Protected fetcher pipeline:

```txt
authenticate
authorize
minimal select
DTO mapping
cache policy
transport-safe return
```

## Writes

Writes go through:

```txt
lib/actions/*
```

Server action pipeline:

```txt
authenticate
authorize
Zod validate
transaction/provider operation
audit event
revalidate
typed result or redirect
```

Transactions and integrations are dependencies, not public write entry points.

## Database

Prisma schema stores durable workflow facts.

Use:

```txt
lib/db/selects/*
lib/db/transactions/*
```

Do not leak raw Prisma models to UI.

Do not store raw provider payloads, raw card data, raw bank data, raw KYC documents, raw identity documents, raw Clerk payloads, or raw Stripe objects.

## DTOs

DTOs live in:

```txt
types/*
```

DTO mappers live in:

```txt
lib/dto/*
```

All Date values crossing transport boundaries are ISO strings.

All money values are integer cents plus display labels where useful.

## Zod

Schemas live in:

```txt
schemas/*
```

Use Zod for:

```txt
server action input
form input
route params
search params
provider return params
normalized webhook envelopes after signature verification
```

Client-side validation is UX only.

Server-side validation is authoritative.

## Domain logic

Vouch-specific state logic lives in:

```txt
lib/vouch/*
```

Expected files:

```txt
lib/vouch/constants.ts
lib/vouch/fees.ts
lib/vouch/lifecycle.ts
lib/vouch/confirmation.ts
lib/vouch/resolution.ts
lib/vouch/idempotency.ts
```

## Provider integrations

Stripe SDK calls live only under:

```txt
lib/integrations/stripe/*
```

Clerk server integration lives behind:

```txt
lib/auth/*
```

Authz lives behind:

```txt
lib/authz/*
```

## API routes

Only provider webhooks are allowed:

```txt
app/api/clerk/webhooks/route.ts
app/api/stripe/webhooks/route.ts
```

No internal app mutation API routes.

Client components must not call `fetch("/api/...")` for Vouch domain mutations.

## Audit

Every important transition writes an audit event.

Audit is append-only.

Audit is not a dispute system.

Audit metadata must be safe and minimal.

Participant-facing timeline receives only participant-safe audit items.
