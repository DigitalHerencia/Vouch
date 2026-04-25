# Host Dashboard Instructions — Payee / Provider Operational Dashboard

## Issue Type

Implementation Instruction

## Domain

Payee/provider-facing dashboard surfaces for accepted Vouches, payout readiness, confirmation actions, and final outcomes.

## Naming Note

This legacy filename says “host.” In Vouch, map “host” to:

> Payee / provider receiving commitment-backed funds after successful dual confirmation.

This is not a public provider dashboard or marketplace profile.

## Source Contracts

- `.agents/contracts/features.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/docs/design-system.md`
- `.agents/docs/user-flows.md`

## Objective

Implement provider/payee dashboard views that help users track accepted Vouches, required confirmations, payout readiness, and completed/expired outcomes.

## Required Scope

Payee dashboard data may show:

- Vouches where user is accepted payee
- invite opportunities opened by token only
- payout readiness
- confirmation-required Vouches
- completed payouts
- expired/refunded Vouches
- failed payment/payout states

## Required Architecture

Use existing dashboard/list infrastructure where possible:

```txt
features/dashboard/
features/vouches/list/
features/vouches/detail/
lib/vouches/fetchers/
lib/payments/fetchers/
components/vouches/
components/payments/
```

Do not create a public provider profile system.

## Required Panels

Payee/provider dashboard should include:

- action required
- active Vouches
- awaiting payer confirmation
- completed Vouches
- expired/refunded Vouches
- payout setup warning if not ready

## Required Actions

Allowed:

- view accepted Vouch
- confirm presence as payee
- view payment/payout status summary
- complete payout setup
- view final outcome

Forbidden:

- edit public provider profile
- publish service listing
- message payer
- rate payer
- dispute Vouch
- manually request fund award

## Required Fetchers

- `listPayeeVouches`
- `getPayeeDashboardSummary`
- `getPayeePayoutReadiness`
- `getVouchDetailForParticipant`

All must enforce participant scope.

## UI Requirements

The UI must prioritize:

- current status
- amount
- confirmation deadline
- whether payer confirmed
- payee confirmation action
- final outcome

Use copy that explains:

> Funds release only after both parties confirm during the window.

## Forbidden Work

Do not build:

- public provider pages
- provider bio
- provider gallery
- provider services
- provider categories
- ratings/reviews
- messaging
- calendar availability
- booking management
- CRM tools

## Acceptance Criteria

- Payee sees only Vouches accepted by them.
- Payee can confirm only active Vouches within the window.
- One-sided payee confirmation shows waiting state.
- Dashboard warns when payout setup is incomplete.
- No public profile or marketplace UI exists.
- No messaging/review/dispute UI exists.
- All fetchers/actions enforce server authz.

## Required Tests

- payee dashboard scope
- payee confirmation allowed
- payer-only Vouches excluded where user is not payee
- payout warning rendering
- no forbidden marketplace routes/components

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:contracts
```
