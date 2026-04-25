# Admin Moderation Instructions — Operational Inspection Only

## Issue Type

Implementation Instruction

## Domain

Admin operational visibility, diagnostics, safe retries, account disabling, audit inspection, and strict no-arbitration enforcement.

## Naming Note

This legacy filename says “moderation,” but Vouch does not moderate disputes.

In Vouch, admin moderation means:

> Operational inspection and technical remediation only.

Admins do not decide who is right.

## Source Contracts

- `.agents/contracts/authz.yaml`
- `.agents/contracts/roles.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/acceptance-gates.yaml`
- `.agents/contracts/routes.yaml`

## Objective

Implement admin views that expose operational state without creating arbitration tooling.

## Required Routes

```txt
/admin
/admin/vouches
/admin/vouches/[vouchId]
/admin/users
/admin/payments
/admin/audit
```

## Required Admin Capabilities

Admin may view:

- users
- verification summaries
- Vouches
- invitations
- confirmations
- payment records
- refund records
- webhook events
- notification events
- audit events
- failure states

Admin may perform:

- safe idempotent retry, if implemented
- user disable, if policy allows
- operational inspection

## Forbidden Admin Capabilities

Do not implement:

- decide dispute
- award funds
- force release
- manually complete without both confirmations
- rewrite confirmation
- edit confirmation timestamp
- upload evidence
- collect claims
- message users
- rate users
- assign blame

## Required Admin Views

### Admin Dashboard

Show:

- total Vouches
- active Vouches
- failed Vouches
- payment failures
- webhook failures
- verification issues
- stuck states

### Admin Vouch List

Filters:

- status
- payment status
- deadline
- failure state

### Admin Vouch Detail

Show:

- Vouch status
- payer/payee IDs
- payment status
- confirmation status
- confirmation timestamps
- refund status
- webhook history
- audit timeline
- notification attempts

Use neutral language. No dispute framing.

### Admin Payments

Show:

- provider
- provider reference redacted/safe
- payment status
- refund status
- failure code
- timestamps

### Admin Audit

Show:

- event name
- actor type
- actor ID
- entity type
- entity ID
- timestamp
- safe metadata

## Safe Retry Rules

Safe retries are allowed only for idempotent technical operations such as:

- retry notification send
- retry provider reconciliation
- retry webhook processing
- retry refund status sync

Safe retries must not change human truth.

Safe retries must write audit events.

## Acceptance Criteria

- Admin routes require admin capability.
- Non-admins cannot access admin routes.
- Admin can inspect Vouch/payment/audit state.
- Admin cannot award funds.
- Admin cannot rewrite confirmation truth.
- Admin cannot open dispute cases.
- Admin safe retry is idempotent and audited.
- Admin UI does not contain arbitration language.

## Required Tests

- admin route access
- non-admin denial
- admin read operational records
- no manual award action exists
- no dispute route/entity/component exists
- safe retry audit event

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate:contracts
```
