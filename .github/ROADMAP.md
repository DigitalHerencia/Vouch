# Roadmap

## Product Principle

Vouch coordinates commitment-backed payments for appointments and in-person agreements.

Both parties confirm presence inside the confirmation window → funds release. Otherwise → refund, void, or non-capture.

## Phase 0 — Repo Foundation

- [ ] root configs
- [ ] Prisma schema
- [ ] Clerk setup
- [ ] Stripe / Connect setup
- [ ] app route shells
- [ ] feature stubs
- [ ] components and shadcn primitives
- [ ] types and schemas
- [ ] actions, fetchers, transactions, selects, mappers

## Phase 1 — Auth and Setup

- [ ] Clerk auth
- [ ] local user sync
- [ ] Clerk webhook verification
- [ ] setup checklist
- [ ] terms acceptance
- [ ] identity verification state
- [ ] adult verification state
- [ ] payment readiness
- [ ] payout readiness

## Phase 2 — Create and Accept Vouch

- [ ] create Vouch form
- [ ] amount validation
- [ ] confirmation window validation
- [ ] invite token generation and hashing
- [ ] email/share invite flow
- [ ] accept Vouch flow
- [ ] decline Vouch flow
- [ ] self-acceptance denial
- [ ] setup blockers

## Phase 3 — Confirmation Lifecycle

- [ ] payer confirmation
- [ ] payee confirmation
- [ ] duplicate confirmation prevention
- [ ] confirmation window enforcement
- [ ] aggregate confirmation status
- [ ] deterministic release/refund branching
- [ ] audit timeline

## Phase 4 — Payment Provider Integration

- [ ] Stripe customer/payment setup
- [ ] Stripe Connect onboarding
- [ ] payment authorization
- [ ] release/capture/transfer
- [ ] refund/void/non-capture
- [ ] webhook ledger
- [ ] payment reconciliation
- [ ] provider failure states

## Phase 5 — User Dashboard

- [ ] empty state
- [ ] action required
- [ ] pending Vouches
- [ ] active Vouches
- [ ] completed Vouches
- [ ] expired/refunded Vouches
- [ ] Vouch detail variants
- [ ] confirmation detail variants

## Phase 6 — Admin Operations

- [ ] admin dashboard
- [ ] admin Vouch list/detail
- [ ] admin users list/detail
- [ ] admin payments list/detail
- [ ] admin webhook events
- [ ] admin audit log
- [ ] safe idempotent retries only

## Explicitly Not Planned

- marketplace
- provider listings
- public profiles
- search/discovery
- ratings/reviews
- messaging
- dispute resolution
- evidence uploads
- manual fund awards
- manual confirmation rewrites
  '@

  "CHANGELOG.md" = @'

# Changelog

All notable project changes should be documented in this file.

The format loosely follows Keep a Changelog, but this is an internal/proprietary product unless relicensed.

## [Unreleased]

### Added

- Initial project governance files.
- GitHub community health files.
- Vouch architecture boundaries.
- Product scope guardrails.

### Changed

- Nothing yet.

### Fixed

- Nothing yet.

### Removed

- Nothing yet.

## Release Categories

Use these headings when relevant:

```txt
Added
Changed
Deprecated
Removed
Fixed
Security
```
