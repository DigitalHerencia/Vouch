# Vouch Audit Instructions

## Purpose

Audit the repo for conformance to Vouch source-of-truth contracts.

Do not merely summarize.

Find violations, classify severity, and provide complete corrected files when asked to fix.

## Audit order

1. Product boundary
2. Route tree
3. App Router purity
4. Read/write boundaries
5. Stripe integration isolation
6. Clerk/auth/authz correctness
7. Prisma schema/state axes
8. Constants/types/Zod alignment
9. Transactions and idempotency
10. Webhook verification/dedupe/reconciliation
11. Confirmation rules
12. DTO safety
13. UI/design-system compliance
14. Tests and validation

## Product boundary checks

Fail if repo contains:

```txt
marketplace
provider directory
search/browse/discovery
public profiles
ratings/reviews
messages/chat
disputes/claims/appeals
evidence/screenshots
manual release
manual refund award
manual payout
confirmation rewrite
admin arbitration
```

## Route checks

Allowed user-facing tenant routes only:

```txt
/dashboard
/vouches/new
/vouches/new/confirm
/vouches/[vouchId]
```

Allowed provider routes only:

```txt
/api/clerk/webhooks
/api/stripe/webhooks
```

Fail if forbidden routes exist.

## App Router purity checks

Fail if `app/**` contains:

```txt
Prisma imports
Stripe SDK imports
business transactions
domain mutations
protected DTO shaping
settlement logic
provider reconciliation
large form logic
```

## Fetcher checks

Every protected fetcher must:

```txt
authenticate
authorize
use minimal select
map DTO
return transport-safe data
declare cache policy
```

Fail if fetcher mutates state or returns raw Prisma/provider objects.

## Action checks

Every action must:

```txt
authenticate
authorize
Zod validate
call transaction/integration
write audit when state changes
revalidate
return typed ActionResult or redirect
```

Fail if action trusts client state for confirmation, payment, settlement, readiness, or role.

## Stripe checks

Fail if:

```txt
Stripe SDK outside lib/integrations/stripe/*
capture without retrieve-before-settlement
cancel/refund without retrieve-before-settlement
browser return finalizes payment state
PaymentIntent is immediate capture for Vouch flow
direct charge is canonical flow
invoice is canonical flow
per-Vouch Product/Price catalog exists
idempotency missing
raw Stripe object exposed to UI
raw provider payload stored unnecessarily
```

## Clerk checks

Fail if:

```txt
role stored as global Clerk metadata authority
terms acceptance stored only in Clerk metadata
Clerk decides Vouch participation
Clerk decides payment readiness
Clerk decides payout readiness
Clerk decides settlement
raw Clerk objects exposed to UI
raw session tokens stored or logged
```

## State checks

Canonical Vouch lifecycle only:

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

Fail if `VouchStatus` includes:

```txt
refunded
voided
canceled
failed
archived
provider_blocked
reconciliation_pending
recovery_required
```

Those belong to separate payment/settlement/archive/recovery axes.

## Confirmation checks

Fail if:

```txt
one-sided confirmation can release funds
late confirmation can release funds
duplicate confirmation is possible
manual/system confirmation exists
GPS is settlement source of truth
screenshots/evidence can influence settlement
support can rewrite confirmation
```

## Webhook checks

Every provider webhook must:

```txt
verify signature
record provider event id once
dedupe duplicate events
classify event
load current state
apply only valid forward movement
mark unsupported events ignored
avoid raw payload storage
```

Fail if duplicate webhook can cause duplicate capture/refund/audit transition.

## DTO checks

Fail if UI receives:

```txt
raw Prisma models
raw Stripe objects
raw Clerk objects
raw webhook payloads
raw identity data
raw card/bank data
internal stack traces
secret provider IDs where unnecessary
```

## UI checks

Fail if UI violates:

```txt
dark brutalist operational SaaS
zero-radius panels
high contrast
status text not color alone
no marketplace UI
no messaging UI
no dispute UI
no soft consumer review/provider-card patterns
```

## Audit output format

Use this format:

```txt
STATUS: PASS | FAIL | PARTIAL

CRITICAL:
- [file] issue
- required correction

HIGH:
- [file] issue
- required correction

MEDIUM:
- [file] issue
- required correction

LOW:
- [file] issue
- required correction

VALIDATION:
- command: result / not run
- blocker if any

NEXT FILES TO FIX:
- path
- path
```

When asked to fix, output complete corrected files only.

````

---

## `.agents/instructions/validation.md`

```md
# Vouch Validation Instructions

## Standard validation ladder

Run the narrowest useful gate first, then widen.

## Basic code checks

```txt
pnpm lint
pnpm typecheck
````

## Prisma checks

```txt
pnpm prisma:validate
```

## Contract checks

```txt
pnpm validate:contracts
```

## Unit/integration tests

```txt
pnpm test
```

## E2E tests

```txt
pnpm test:e2e
```

## Full validation

```txt
pnpm validate
```

## Required test coverage

Payment and Stripe:

```txt
manual-capture PaymentIntent creation
application fee snapshot
Checkout Session creation
PaymentIntent status mapping
retrieve-before-settlement
idempotent capture
idempotent cancel/void
refund fallback
provider restriction handling
```

Webhooks:

```txt
Stripe signature verification
Clerk signature verification
provider event id dedupe
duplicate webhook harmless
late webhook reconciles only valid forward movement
unsupported webhook ignored
raw provider payload not exposed
```

Confirmation:

```txt
confirmation window enforcement
duplicate confirmation prevention
one-sided confirmation does not release
late confirmation does not release
valid bilateral confirmation triggers settlement evaluation
offline payload time bucket tolerance
invalid offline payload rejection
```

Auth/readiness:

```txt
authenticated tenant route required
local active user required
terms acceptance required
merchant payout readiness required for create
customer payment readiness required for authorization
role scoped to Vouch
self-acceptance rejected
```

Architecture:

```txt
no Prisma in app or components
no Stripe SDK outside lib/integrations/stripe
no internal app mutation API routes
protected reads use fetchers
writes use server actions
DTOs are transport-safe
```

Forbidden surfaces:

```txt
no marketplace routes
no search/browse routes
no messaging routes
no disputes/claims/appeals routes
no evidence upload
no ratings/reviews
no public provider profiles
no manual settlement controls
```

## Validation report format

Use:

```txt
VALIDATION STATUS: PASS | FAIL | NOT RUN

Commands:
- pnpm lint: PASS | FAIL | NOT RUN
- pnpm typecheck: PASS | FAIL | NOT RUN
- pnpm prisma:validate: PASS | FAIL | NOT RUN
- pnpm validate:contracts: PASS | FAIL | NOT RUN
- pnpm test: PASS | FAIL | NOT RUN
- pnpm test:e2e: PASS | FAIL | NOT RUN
- pnpm validate: PASS | FAIL | NOT RUN

Blockers:
- none
```

Do not claim validation passed unless it was run and passed.

If validation was not run locally, say so.
