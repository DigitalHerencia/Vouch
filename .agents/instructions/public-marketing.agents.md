# Public Marketing Instructions — Informational Pages Only

## Issue Type

Implementation Instruction

## Domain

Public marketing, education, legal-safe positioning, and explicit prevention of marketplace/discovery behavior.

## Source Contracts

- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/domain-model.yaml`
- `.agents/docs/launch-copy.md`
- `.agents/docs/design-system.md`

## Objective

Implement public pages that explain Vouch without creating discovery, search, marketplace, or provider browsing behavior.

## Allowed Routes

Allowed public routes:

```txt
/
 /how-it-works
 /pricing
 /faq
 /legal/terms
 /legal/privacy
```

## Required Public Features

### Landing Page

Must include:

- hero
- concise mechanism
- use cases
- how it works
- pricing summary
- legal-safe positioning
- primary CTA

Approved positioning:

> Commitment-backed payments for appointments and in-person agreements.

### How It Works

Must explain:

1. Create a Vouch
2. Other party accepts
3. Both confirm presence
4. Funds release or refund

### Pricing

Must explain:

- platform fee model
- minimum fee
- percentage fee
- fees shown before commitment

### FAQ

Must answer:

- What is Vouch?
- Is Vouch a marketplace?
- Does Vouch hold money?
- What happens if only one person confirms?
- What happens if nobody confirms?
- Does Vouch decide disputes?
- Does Vouch guarantee someone shows up?

### Legal Pages

Must include conservative language:

- Vouch is payment coordination
- Vouch is not marketplace
- Vouch is not arbitration
- provider handles payment processing
- dual confirmation rule
- refund/non-capture rule

## Forbidden Work

Do not implement:

- `/browse`
- `/providers`
- `/categories`
- `/search`
- `/messages`
- `/reviews`
- `/disputes`
- provider directory
- user profile cards
- featured providers
- category chips for services
- marketplace filters
- recommendations
- ratings
- reviews
- social proof implying provider endorsement
- “book now” marketplace CTA

## Copy Requirements

Use:

- commitment-backed payment
- no-show protection
- both parties confirm
- release funds
- refund
- appointment
- in-person agreement

Avoid:

- escrow
- trusted provider
- verified service
- guaranteed appointment
- safe meetup
- dispute protection
- scam-proof
- marketplace
- ratings/reviews

## UI Requirements

Design must be:

- serious
- precise
- neutral
- professional
- minimal
- high-contrast
- status/rule oriented

Public pages must not visually imply a marketplace. No grids of people, provider cards, ratings, or listing-style layouts.

## Analytics

Allowed analytics:

- `marketing.page_viewed`
- `marketing.cta_clicked`
- `auth.sign_up_started`

Forbidden analytics:

- provider profile views
- search queries
- category selected
- review submitted
- message sent
- dispute opened

## Acceptance Criteria

- Public pages explain Vouch in under 10 seconds.
- Landing page uses approved positioning.
- No forbidden discovery routes exist.
- No marketplace navigation exists.
- No profile/listing/review UI exists.
- Legal-safe copy avoids escrow and guarantee claims.
- CTAs point to auth/create flow, not provider discovery.

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:contracts
```
