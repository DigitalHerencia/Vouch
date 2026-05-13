# Vouch Launch Checklist

## Product invariant

Vouch is a narrow commitment-backed payment coordination system for appointments and in-person agreements.

Both participants confirm presence inside the confirmation window → funds release.

Anything else → funds do not release. Stripe provider state determines non-capture, cancellation, or refund.

Vouch does not provide marketplace discovery, scheduling, messaging, reviews, disputes, evidence review, mediation, arbitration, escrow, manual awards, support overrides, or manual confirmation rewrites.

## Required validation

```bash
pnpm prisma:validate
pnpm validate:contracts
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate
pnpm validate:all
```
