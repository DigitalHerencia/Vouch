# Governance

## Project Definition

Vouch is a commitment-backed payment coordination system.

The governing rule is:

> Both parties confirm presence within the confirmation window → funds release. Otherwise → refund, void, or non-capture.

## Source Authority

Follow this source order:

1. `.agents/docs/*.md`
2. `.agents/contracts/*.yaml`
3. `.agents/instructions/*.instructions.md`
4. existing code
5. implementation judgment

If implementation conflicts with contracts, contracts win.

If contracts conflict with docs, stop and report the conflict.

## Non-Negotiables

### No Marketplace

Do not create:

- profiles
- listings
- search/discovery
- categories
- recommendations
- featured providers
- ratings/reviews
- reputation scores
- marketplace nav/routes

### No Arbitration

Do not create:

- dispute cases
- claims
- evidence uploads
- appeals
- admin award-funds actions
- manual release overrides
- confirmation rewrites

### No Direct Custody

Vouch coordinates payment state through provider infrastructure. Do not store raw card data, raw identity documents, full provider payloads, or secrets.

### Dual Confirmation Required

Funds release only when:

- Vouch is active
- payer confirmed within the confirmation window
- payee confirmed within the confirmation window
- provider release/capture/transfer succeeds or is provider-accepted

One-sided confirmation never releases funds.

## Admin Scope

Admins inspect operational state only.

Admins may perform safe idempotent retries when explicitly allowed.

Admins do not decide who is right.

## Change Control

Any change that affects the lifecycle, payment state machine, authz rules, admin capability, or data model must be checked against `.agents/contracts`.
