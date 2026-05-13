# AGENTS.md

## Project

Vouch is a narrow commitment-backed payment coordination system for appointments and in-person agreements.

Core invariant:

```txt
both parties confirm presence within the confirmation window
-> funds release

otherwise
-> refund, void, cancel, expiration, or non-capture according to provider state
```

Outcome follows system state.

Vouch does not decide who is right.
Vouch asks what happened.

## Absolute product boundaries

Vouch is not:

```txt
marketplace
broker
scheduler
messaging app
review system
rating system
dispute-resolution system
escrow provider
public directory
search or discovery platform
social platform
manual settlement desk
evidence review product
arbitration product
```

Do not add:

```txt
browse
search
discovery
public profiles
service listings
categories
ratings
reviews
messaging
claims
appeals
disputes
evidence
screenshots
manual fund awards
manual payout controls
manual refund decisions
manual confirmation rewrites
admin arbitration
support override settlement
```

## Source order

When implementing or auditing, use this authority order:

```txt
1. .agents/contracts/*.yaml
2. .agents/docs/*.md
3. .agents/instructions/*.md
4. existing repository code
5. implementation judgment
```

If code conflicts with contracts, contracts win.

If docs conflict with contracts, stop and report the conflict.

If requested behavior violates product boundaries, refuse the change and propose the closest valid Vouch-native alternative.

## Stack

```txt
Next.js App Router
React Server Components
React 19
TypeScript
Prisma
Neon Postgres
Clerk
Stripe + Stripe Connect
Zod
React Hook Form
Tailwind CSS v4
shadcn/Base UI
Vitest
Playwright
pnpm
```

## Architecture rules

`app/**` is route shell only.

Allowed in `app/**`:

```txt
layouts
loading/error/not-found/global-error boundaries
thin page.tsx files
metadata
params/searchParams handoff
redirects
Suspense wrappers
feature composition
external provider route handlers only
```

Forbidden in `app/**`:

```txt
Prisma queries
Stripe SDK calls
Clerk business logic beyond route/session handoff
authorization decisions
DTO shaping
domain mutation
settlement logic
provider reconciliation
complex forms
large copy blocks
```

Protected reads go through:

```txt
lib/fetchers/*
```

Writes go through:

```txt
lib/actions/*
lib/db/transactions/*
lib/integrations/*
```

Auth lives in:

```txt
lib/auth/*
```

Authorization lives in:

```txt
lib/authz/*
```

DTOs live in:

```txt
types/*
```

Zod schemas live in:

```txt
schemas/*
```

Prisma selects live in:

```txt
lib/db/selects/*
```

DTO mappers live in:

```txt
lib/dto/*
```

Stripe SDK calls live only in:

```txt
lib/integrations/stripe/*
```

Vouch state logic lives in:

```txt
lib/vouch/*
```

## Read contract

Every protected fetcher must follow:

```txt
authenticate
authorize
minimal select
DTO mapping
cache policy
transport-safe return
```

Fetchers must not mutate state.

Fetchers must not return raw Prisma rows, raw Stripe objects, raw Clerk objects, secrets, provider payloads, or sensitive identity/payment data.

## Write contract

Every server action must follow:

```txt
authenticate
authorize
Zod validate
execute transaction and/or provider operation
write audit event
revalidate affected paths/tags
return typed result or redirect
```

Transactions are atomic persistence helpers.

Integrations call providers.

Actions orchestrate.

Routes and components do not bypass actions.

## Provider truth

Stripe owns payment truth.

Clerk owns authentication truth.

Vouch owns workflow truth.

Webhooks reconcile provider truth.

Actions enforce transitions.

Transactions persist facts.

Fetchers return safe DTOs.

Components display results.

The UI never creates truth.

## Stripe rules

Vouch uses Stripe as provider rails, not as the product surface.

Canonical Vouch payments use:

```txt
Stripe Checkout
manual-capture PaymentIntents
Stripe Connect destination-charge style settlement
application fees
idempotent capture/cancel/refund
webhook reconciliation
retrieve-before-settlement
```

Before capture, cancel, void, refund, retry, or settlement reconciliation, retrieve current Stripe provider state.

Never finalize payment from:

```txt
browser return URL
query params
client state
optimistic UI
local DB status alone
```

## Clerk rules

Clerk authenticates users.

Clerk does not decide:

```txt
Vouch participation
Vouch role
payment readiness
payout readiness
settlement eligibility
presence confirmation truth
terms truth without DB persistence
```

Role is contextual per Vouch.

The same user may be merchant on one Vouch and customer on another.

## Confirmation rules

Vouch uses deterministic bilateral confirmation.

Each participant may confirm only for themselves, inside the confirmation window, once.

One-sided confirmation never releases funds.

Late confirmation never releases funds.

Code generation alone means nothing.

Only valid bilateral confirmation inside the configured window can trigger settlement evaluation.

No GPS, screenshots, manual support confirmation, dispute evidence, or arbitration flow may be introduced.

## Lifecycle states

Canonical Vouch lifecycle:

```txt
draft
committed
sent
accepted
authorized
confirmable
completed
expired
```

Do not add provider/payment states to `VouchStatus`.

Forbidden lifecycle pollution:

```txt
refunded
voided
canceled
failed
provider_blocked
archived
reconciliation_pending
recovery_required
```

Those belong to payment, settlement, archive, webhook, or operational sub-state axes.

## Required validation

Run scope-appropriate gates:

```txt
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm validate:contracts
pnpm test
pnpm test:e2e
pnpm validate
```

For implementation work, report:

```txt
complete / not complete
files changed
validation run
validation result
blockers only
```
