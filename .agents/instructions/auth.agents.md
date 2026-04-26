# Auth Instructions — Authentication, Readiness, and Authorization

## Issue Type

Implementation Instruction

## Domain

Authentication, account readiness, verification gates, role resolution, and server-side authorization.

## Source Contracts

- `.agents/contracts/roles.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/domain-model.yaml`

## Objective

Implement Clerk-backed authentication and Vouch account readiness without allowing unauthenticated or ineligible users to perform payment-bearing actions.

The server is authoritative for:

- current user resolution
- account status
- participant role
- admin capability
- verification readiness
- payment readiness
- payout readiness
- terms acceptance

## Required Architecture

Use the server-first structure:

```txt
lib/auth/
lib/authz/
lib/users/
lib/verification/
features/auth/
features/setup/
app/sign-in/
app/sign-up/
app/setup/
```

`app/` route files must stay thin. Do not place authz logic directly in UI components.

## Required Work

### 1. Auth Provider Integration

Implement Clerk authentication helpers in `lib/auth/`.

Required helpers:

- `getCurrentUser()`
- `requireUser()`
- `requireActiveUser()`
- `getCurrentUserId()`
- `syncClerkUser()`
- `getUserSetupStatus()`

### 2. User Sync

Create or update local `User` and `VerificationProfile` records from Clerk events.

Webhook requirements:

- verify provider signature
- process idempotently
- upsert local user
- create default verification profile
- write audit event
- never store full Clerk payload

### 3. Role Resolution

Implement contextual role helpers in `lib/authz/`.

Required checks:

- anonymous
- authenticated user
- admin
- payer for Vouch
- accepted payee for Vouch
- invited payee candidate

Do not rely on UI visibility for authorization.

### 4. Setup Gates

Implement readiness checks for:

- identity verified
- adult verified
- payment ready
- payout ready
- terms accepted
- active user

Create Vouch requires:

- active user
- identity verified
- adult verified
- payment ready
- terms accepted

Accept Vouch requires:

- active user
- identity verified
- adult verified
- payout ready
- terms accepted
- valid invitation
- not self-acceptance

Confirm presence requires:

- active user
- participant relationship
- active Vouch
- open confirmation window
- no duplicate confirmation

### 5. Route Protection

Protect routes according to `routes.yaml`.

Authenticated app routes:

- `/dashboard`
- `/setup`
- `/settings`
- `/settings/payment`
- `/settings/payout`
- `/settings/verification`
- `/vouches`
- `/vouches/new`
- `/vouches/[vouchId]`
- `/vouches/[vouchId]/confirm`

Admin routes require admin capability:

- `/admin`
- `/admin/vouches`
- `/admin/vouches/[vouchId]`
- `/admin/users`
- `/admin/payments`
- `/admin/audit`

## Forbidden Work

Do not create:

- public profiles
- marketplace roles
- reputation roles
- reviewer/moderator roles
- dispute roles
- “trusted provider” badges
- client-side-only auth checks

## Acceptance Criteria

- Unauthenticated users cannot create, accept, confirm, or view protected Vouches.
- Users can only view Vouches where they are payer, accepted payee, valid invite candidate, or admin.
- Payers cannot accept their own Vouches.
- Disabled users cannot create, accept, or confirm.
- Admins can inspect operational records only.
- All protected fetchers/actions enforce auth server-side.
- Clerk webhook processing is signed and idempotent.
- Authz tests cover unrelated access denial, self-accept denial, participant access, and admin access.

## Required Validation

Run when applicable:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:contracts
```

## Notes

If auth requirements conflict with `authz.yaml`, stop and report. Do not invent new access rules.

````

---
