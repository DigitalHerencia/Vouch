# Vouch Lifecycle Instructions — Creation, Acceptance, Confirmation, Resolution

## Issue Type

Implementation Instruction

## Domain

Vouch creation, invitation, acceptance, confirmation, expiration, release, refund, and deterministic lifecycle resolution.

## Source Contracts

- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/acceptance-gates.yaml`

## Objective

Implement the core Vouch lifecycle:

```txt
create → accept → both confirm → release
otherwise → refund / void / non-capture
```

## Required Architecture

Use:

```txt
features/vouches/
lib/vouches/actions/
lib/vouches/fetchers/
lib/payments/
lib/audit/
lib/notifications/
schemas/vouches/
types/vouches/
components/vouches/
```

Do not put lifecycle logic in components or route files.

## Required Work

### 1. Create Vouch

Implement `createVouch`.

Required sequence:

1. authenticate
2. authorize payer eligibility
3. validate input with Zod
4. calculate platform fee server-side
5. initialize provider payment or local payment record
6. create Vouch as `pending`
7. create Invitation
8. write `vouch.created` audit event
9. queue invite notification if recipient email exists
10. revalidate Vouch/dashboard tags

Inputs:

- amount
- currency
- meeting start time
- confirmation open time
- confirmation expiration time
- recipient email or share-link mode
- optional short label

Do not request service category, public listing fields, detailed purpose, or open-ended marketplace text.

### 2. Share / Invite Vouch

Invitation token rules:

- generate securely
- store hash only
- never store plaintext token
- allow lookup by hashed token
- expire according to contract
- prevent reuse after acceptance/expiration/invalidation

### 3. Accept Vouch

Implement `acceptVouch`.

Required sequence:

1. authenticate
2. validate invitation token
3. authorize invited candidate
4. validate payee eligibility
5. block payer self-acceptance
6. ensure Vouch is `pending`
7. ensure no existing payee
8. bind payee
9. transition Vouch to `active`
10. write `vouch.accepted` audit event
11. queue notification
12. revalidate tags

### 4. Decline Vouch

Implement `declineVouch`.

Required sequence:

1. authenticate
2. authorize invitation
3. ensure Vouch is `pending`
4. mark invitation declined
5. write audit event
6. notify payer

Decline must not create arbitration or dispute state.

### 5. Confirm Presence

Implement `confirmPresence`.

Required sequence:

1. authenticate
2. authorize participant
3. ensure Vouch is `active`
4. ensure current time is within confirmation window
5. prevent duplicate confirmation
6. create `PresenceConfirmation`
7. write payer/payee confirmation audit event
8. check aggregate confirmation status
9. if both confirmed, complete Vouch
10. otherwise show waiting state
11. revalidate tags

One-sided confirmation must not release funds.

### 6. Complete Vouch

Completion requires:

- Vouch is `active`
- payer confirmation exists
- payee confirmation exists
- both confirmations occurred in window
- provider release/capture/transfer succeeds or is accepted as processing

After completion:

- transition Vouch to `completed`
- update PaymentRecord
- write audit events
- queue notifications
- revalidate tags

### 7. Expire / Refund Vouch

Implement expiration logic via scheduled process, lazy read/action evaluation, or provider reconciliation.

Required sequence:

1. find unresolved expired Vouches
2. verify aggregate confirmation status is not `both_confirmed`
3. initiate refund, void, or non-capture
4. transition to `expired` / `refunded`
5. write audit events
6. queue notifications
7. revalidate tags

Expiration cases:

- no confirmations
- only payer confirmed
- only payee confirmed
- payee never accepted
- payment failed before resolution

## Acceptance Criteria

- Eligible payer can create Pending Vouch.
- Valid payee can accept Pending Vouch.
- Payer cannot accept own Vouch.
- Only one payee can accept a Vouch.
- Payer and payee can each confirm once.
- Confirmations outside the window are blocked.
- One-sided confirmation does not release funds.
- Both confirmations complete Vouch and trigger payment release.
- Missing confirmation expires/refunds/voids/non-captures.
- Every lifecycle mutation writes audit events.
- Payment failures produce safe failed state and admin visibility.

## Required Tests

- create schema validation
- accept schema validation
- confirm schema validation
- state transition tests
- duplicate confirmation tests
- self-acceptance denial
- expiration/refund tests
- unauthorized access tests

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
pnpm validate:contracts
```

```

```
