# Database / Prisma Instructions — Vouch

## Issue Type

Implementation Instruction

## Domain

Prisma schema, migrations, relational constraints, indexes, DTO-safe query shapes, and persistence integrity.

## Source Contracts

- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/roles.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/acceptance-gates.yaml`
- `.agents/docs/tech-requirements.md`

## Objective

Implement the canonical Vouch persistence model using Prisma and Neon PostgreSQL.

The Prisma schema must reflect the YAML domain model. If schema and contract conflict, contract wins.

## Required Entities

Implement models for:

- `User`
- `VerificationProfile`
- `PaymentCustomer`
- `ConnectedAccount`
- `Vouch`
- `Invitation`
- `PresenceConfirmation`
- `PaymentRecord`
- `RefundRecord`
- `TermsAcceptance`
- `AuditEvent`
- `NotificationEvent`
- `PaymentWebhookEvent`

## Required Enums

Implement enums aligned with contracts:

- user status
- verification status
- payment readiness status
- payout readiness status
- Vouch status
- invitation status
- participant role
- confirmation status
- payment status
- refund status
- audit actor type
- notification channel
- notification status

## Required Constraints

### User

- unique local ID
- unique Clerk user ID
- status defaults to active
- one verification profile
- one payment customer
- one connected account

### Vouch

Must include:

- payer ID
- optional payee ID
- amount cents
- currency
- platform fee cents
- status
- label
- meeting start time
- confirmation open time
- confirmation expiration time
- lifecycle timestamps

Constraints:

- payer is immutable after creation
- payee is null until acceptance
- payee cannot equal payer
- status defaults to `pending`
- confirmation open time must be before expiration
- completed/expired/canceled/failed states require corresponding timestamps at service layer

### Invitation

Required:

- one invitation per Vouch
- token hash unique
- plaintext token never stored
- status
- expiration timestamp
- opened/accepted/declined timestamps

### PresenceConfirmation

Required uniqueness:

- one confirmation per Vouch per participant role
- one confirmation per Vouch per user

Required:

- Vouch ID
- user ID
- participant role
- status
- method
- confirmed timestamp

### PaymentWebhookEvent

Required:

- unique provider event ID
- processed flag
- received timestamp
- processed timestamp
- processing error field

Webhook records must support idempotency.

## Required Indexes

Add indexes for:

- `Vouch.payer_id`
- `Vouch.payee_id`
- `Vouch.status`
- `Vouch.confirmation_expires_at`
- participant dashboard queries
- `Invitation.token_hash`
- `PaymentRecord.provider_payment_id`
- `PaymentWebhookEvent.provider_event_id`
- `AuditEvent.entity_type + entity_id`
- `NotificationEvent.recipient_user_id`
- `NotificationEvent.vouch_id`

## Data Safety Rules

Do not store:

- raw card data
- raw identity documents
- full Stripe payloads
- full Clerk payloads
- full webhook payloads
- unnecessary location history
- private messages
- detailed meeting purpose
- public service descriptions

Store:

- provider IDs
- statuses
- timestamps
- safe error codes
- safe audit metadata

## Query Shape Rules

Centralize reusable query shapes.

Recommended:

```txt
lib/db/selects/user.selects.ts
lib/db/selects/vouch.selects.ts
lib/db/selects/payment.selects.ts
lib/db/selects/audit.selects.ts
```

Fetchers must map Prisma records into DTOs before returning to features.

## Migration Rules

Before migration:

- inspect existing schema
- preserve data unless task explicitly permits reset
- avoid destructive migration without approval
- validate against domain-model contract

After migration:

```bash
pnpm prisma:generate
pnpm prisma:validate
pnpm typecheck
pnpm test
```

## Seed Rules

Seed data may include:

- demo payer
- demo payee
- pending Vouch
- active Vouch
- completed Vouch
- expired/refunded Vouch
- failed payment example
- admin user

Seed must not include real personal data.

## Forbidden Models

Do not create:

- `PublicProfile`
- `Review`
- `Rating`
- `MessageThread`
- `ServiceListing`
- `MarketplaceCategory`
- `Recommendation`
- `DisputeCase`
- `EvidenceUpload`
- `ReputationScore`

## Acceptance Criteria

- Prisma validates.
- All canonical entities exist.
- Required relations exist.
- Required uniqueness constraints exist.
- Required indexes exist.
- Raw sensitive data is not stored.
- Vouch lifecycle can be represented deterministically.
- Webhook idempotency can be enforced.
- Audit events are append-only by convention.
- Tests cover critical state and authz helpers.

## Stop Conditions

Stop if:

- contract and schema disagree
- migration may destroy data
- payment provider flow requires unresolved custody decision
- schema requires forbidden marketplace/dispute entities
