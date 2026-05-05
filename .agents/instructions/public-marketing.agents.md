# Public Marketing Instructions

## Issue Type

Implementation Instruction

## Domain

Public marketing, education, legal-safe positioning, and product explanation.

## Source Contracts

- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/domain-model.yaml`
- `.agents/docs/launch-copy.md`
- `.agents/docs/design-system.md`

## Objective

Implement public pages that clearly explain Vouch, the payment coordination model, the pricing model, and the confirmation outcome flow.

## Route Placement

The root marketing home page is intentionally implemented at:

- `app/page.tsx`

Do not move the home page into `app/(public)/page.tsx`.

## Public Marketing Routes

- `/`
- `/pricing`
- `/faq`
- `/legal/terms`
- `/legal/privacy`

## Public Access Routes

- `/sign-in`
- `/sign-up`
- `/vouches/invite/[token]`

## Landing Page

Should include:

- hero
- concise mechanism
- use cases
- embedded process explanation
- pricing summary
- legal-safe positioning
- primary CTA

Approved positioning:

> Commitment-backed payments for appointments and in-person agreements.

## Pricing

Should explain:

- platform fee model
- minimum fee
- percentage fee
- fees shown before commitment
- payment flow
- both-confirm release rule

## FAQ

Should answer product, payment, confirmation, and account setup questions in plain language.

## Legal Pages

Should include conservative product language, payment-provider references, confirmation rules, data handling, and user responsibilities.

## UI Requirements

Design should be:

- serious
- precise
- neutral
- professional
- minimal
- high-contrast
- status/rule oriented

## Analytics

Allowed analytics events for public pages:

- `marketing.page_viewed`
- `marketing.cta_clicked`
- `auth.sign_up_started`

## Acceptance Criteria

- Public pages explain Vouch quickly.
- Landing page uses approved positioning.
- CTAs point to auth/create flow or pricing.
- Public routes match `.agents/contracts/routes.yaml`.

## Required Validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:contracts`
