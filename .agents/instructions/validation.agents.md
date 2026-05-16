# Vouch Validation Instructions

## Purpose

Validation proves that the repo still conforms to the Vouch source-of-truth contracts after implementation or audit fixes.

Do not claim validation passed unless the command was actually run and passed.

If validation was not run, say `NOT RUN`.

## Standard Validation Ladder

Run the narrowest useful gate first, then widen.

Recommended order:

```txt
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm validate:contracts
pnpm test
pnpm test:e2e
pnpm validate
```

## Basic Code Checks

```txt
pnpm lint
pnpm typecheck
```

## Prisma Checks

```txt
pnpm prisma:validate
```

## Contract Checks

```txt
pnpm validate:contracts
```

## Unit and Integration Tests

```txt
pnpm test
```

## E2E Tests

```txt
pnpm test:e2e
```

## Full Validation

```txt
pnpm validate
```

## Required Test Coverage

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

## Validation Report Format

Use this exact format:

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

## Validation Rules

Do not say validation passed unless it was run.

Do not hide failed validation.

If a command fails, report:

```txt
command
failure summary
blocking file/path if known
next correction target
```

If validation cannot be run because the agent lacks repo/runtime access, report:

```txt
VALIDATION STATUS: NOT RUN
Blocker: no local runtime access
Required user command: [command]
```
