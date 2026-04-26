# Payee Readiness Instructions — Verification, Payout, and Terms

## Issue Type

Implementation Instruction

## Domain

Payout setup, verification, terms acceptance, and payee/provider eligibility.

## Source Contracts

- `.agents/contracts/roles.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/domain-model.yaml`
- `.agents/docs/user-flows.md`

## Objective

Implement setup flows that make a payee eligible to accept a Vouch and receive funds.

Payee acceptance requires:

- active user
- identity verified
- adult verified
- payout ready
- current terms accepted
- valid invitation
- Vouch pending
- not self-acceptance

## Required Routes

```txt
/setup
/settings/payout
/settings/verification
```

## Required Architecture

Use:

```txt
features/setup/
features/verification/
features/payments/payout/
lib/verification/
lib/payments/
lib/authz/
schemas/setup/
components/setup/
```

## Required Setup Items

Payee/provider readiness checklist:

- account active
- identity verification
- adult eligibility
- payout account / connected account
- terms acceptance

Optional display:

- payment method readiness if user also wants to create Vouches

## Stripe Connect / Payout Setup

Implement payout onboarding via provider-hosted or provider-secure flow.

Rules:

- do not collect raw bank details directly
- do not store raw identity documents
- store provider account ID and readiness flags
- receive provider updates via signed webhook
- write audit events

## Verification

Verification may use Stripe Identity or equivalent.

Track statuses:

- unstarted
- pending
- verified
- rejected
- requires_action
- expired

Do not store raw verification payloads.

## Terms Acceptance

Implement terms acceptance with:

- user ID
- terms version
- accepted timestamp
- optional hashed IP/user agent

Do not allow payment-bearing acceptance without current terms.

## Invite Return Flow

If user arrives from invite:

1. preserve invite token
2. show missing setup items
3. complete required setup
4. return to `/vouches/invite/[token]`

Return paths must be internal-only.

## Forbidden Work

Do not ask for:

- public business profile
- service category
- portfolio
- public bio
- provider listing details
- availability calendar
- pricing menu
- reviews
- ratings

## Acceptance Criteria

- Payee cannot accept Vouch until required setup passes.
- Setup checklist clearly shows blocked reason.
- Payout setup uses provider infrastructure.
- Verification status updates are server-side/provider-backed.
- Terms acceptance is recorded.
- Invite return flow works without leaking protected data.
- No marketplace onboarding fields exist.

## Required Tests

- setup gate calculation
- payout readiness gate
- verification status gate
- terms acceptance gate
- invite return path validation
- blocked acceptance test

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
```
