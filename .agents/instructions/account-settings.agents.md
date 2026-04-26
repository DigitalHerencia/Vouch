# Account Settings Instructions — Private Readiness Profile

## Issue Type

Implementation Instruction

## Domain

Private account settings and readiness profile.

## Source Contracts

- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/docs/design-system.md`
- `.agents/docs/launch-copy.md`

## Objective

Implement private account/settings surfaces that let a user understand and manage readiness.

Allowed routes:

txt
/settings
/settings/payment
/settings/payout
/settings/verification
/setup

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

bash
pnpm lint
pnpm typecheck
pnpm test
