# Auth Instructions — Vouch

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

# `.agents/instructions/host-profile.instructions.md`

```md
# Host Profile Instructions — Private Account / Readiness Profile Only

## Issue Type

Implementation Instruction

## Domain

Private account settings and readiness profile.

## Naming Note

This legacy filename says “host profile.” Vouch prohibits public provider profiles.

In Vouch, this file means:

> Private account settings and readiness status for a payee/provider.

Do not implement public profiles.

## Source Contracts

- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/docs/design-system.md`
- `.agents/docs/launch-copy.md`

## Objective

Implement private account/settings surfaces that let a user understand and manage readiness.

Allowed routes:

```txt
/settings
/settings/payment
/settings/payout
/settings/verification
/setup
````

## Allowed Profile Data

Private account may show:

- display name
- email
- phone if provided by auth provider
- account status
- verification status
- payment readiness
- payout readiness
- connected account status
- terms acceptance status

## Forbidden Public Profile Data

Do not create fields for:

- public bio
- avatar gallery
- services
- categories
- hourly rates
- provider description
- public availability
- portfolio
- ratings
- reviews
- badges
- reputation score

## Required Components

- `AccountStatusCard`
- `VerificationStatusCard`
- `PaymentReadinessCard`
- `PayoutReadinessCard`
- `TermsStatusCard`
- `SetupChecklist`
- `SettingsSection`

## Required Fetchers

- `getAccountSettings`
- `getSetupStatus`
- `getVerificationStatus`
- `getPaymentReadiness`
- `getPayoutReadiness`

All fetchers must authenticate and scope to current user.

## Copy Requirements

Use:

- Finish setup to continue.
- Complete payout setup before accepting Vouches.
- Add a payment method before creating Vouches.
- Complete verification before using payment-backed flows.

Avoid:

- Complete your provider profile.
- Get discovered.
- Improve your ranking.
- Add services.
- Become a featured provider.

## Acceptance Criteria

- Settings are private and authenticated.
- User sees readiness state clearly.
- User can start payment, payout, and verification flows.
- No public profile route exists.
- No marketplace profile fields exist.
- Setup blockers are actionable and specific.
- Authz is server-enforced.

## Required Tests

- settings route requires auth
- user cannot view another user settings
- setup status DTO is safe
- no public profile routes/components exist

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
```
