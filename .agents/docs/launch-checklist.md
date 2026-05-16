# Vouch Launch Checklist

## Product invariant

Vouch is a narrow commitment-backed payment coordination system for appointments and in-person agreements.

Both participants confirm presence inside the confirmation window → funds release.

Anything else → funds do not release. Stripe provider state determines non-capture, cancellation, expiration, void, or refund.

Stripe owns provider payment truth.

Clerk owns authentication truth.

Vouch owns workflow truth.

Webhooks reconcile provider truth.

Outcome follows system state.

Vouch does not provide marketplace discovery, scheduling, messaging, reviews, disputes, evidence review, mediation, arbitration, escrow, manual awards, support overrides, or manual confirmation rewrites.

## Product boundary checklist

Before launch, confirm the app does not include:

- marketplace discovery
- public provider profiles
- service listings
- search or browse surfaces
- scheduling system
- internal messaging
- chat threads
- reviews
- ratings
- disputes
- claims
- appeals
- evidence uploads
- screenshot review
- arbitration tools
- manual settlement awards
- support override flows
- manual confirmation rewrites
- force-release controls
- force-refund controls
- internal fake payment pages
- internal payout-management pages

## Workflow checklist

Before launch, confirm:

- committed Vouch terms are immutable
- Vouch amount is immutable after commitment
- appointment date is immutable after commitment
- confirmation window is immutable after commitment
- provider references are immutable after commitment
- one-sided confirmation never releases funds
- code generation alone never releases funds
- confirmation outside the window is rejected
- duplicate confirmation is rejected
- successful bilateral confirmation locks confirmation truth
- completed Vouches are terminal
- expired Vouches are terminal
- archived Vouches are read-only and remain accessible by direct URL
- recovery state is internal-only and non-discretionary

## Payment checklist

Before launch, confirm:

- Stripe handles payment authorization
- Stripe handles payment method collection
- Stripe handles billing details
- Stripe handles Connect onboarding
- Stripe handles KYC/compliance collection
- Stripe handles payout banking collection
- Stripe handles payout execution
- Vouch stores only safe provider references and normalized provider state
- Vouch does not store raw Stripe objects
- Vouch does not store raw card data
- Vouch does not store raw bank data
- Vouch does not store raw KYC data
- Vouch retrieves current Stripe provider state before capture, cancellation, void, refund, or settlement reconciliation
- browser return URLs are not treated as payment truth
- provider authorization windows are enforced
- non-capture is preferred over refund whenever possible
- refunds are provider-backed fallback behavior, not discretionary remedies
- idempotency keys are used for settlement-affecting provider operations

## Confirmation checklist

Before launch, confirm:

- confirmation is bilateral
- confirmation is role-aware
- confirmation is valid only inside the configured confirmation window
- each participant can confirm only once
- merchant and customer confirmation codes are role-specific
- submitted codes validate the counterparty code
- offline confirmation, if enabled, proves valid time-bucket membership
- clock-skew tolerance is bounded
- GPS does not determine settlement truth
- screenshots do not determine settlement truth
- evidence uploads do not determine settlement truth
- support cannot manually confirm presence
- admin cannot rewrite confirmation truth

## Auth and readiness checklist

Before launch, confirm:

- Clerk handles authentication
- Vouch maintains a local user record
- local user status is enforced server-side
- account-level agreement is persisted in Vouch DB
- terms acceptance is not stored only in Clerk metadata
- per-Vouch disclaimer acceptance is separate from account-level agreement
- merchant readiness checks Stripe Connect and payout readiness
- customer readiness checks Stripe customer/payment-method readiness
- readiness gates are enforced before protected actions
- role is scoped to the Vouch, not global account type
- users can be merchant on one Vouch and customer on another

## Legal and copy checklist

Before launch, confirm all public and in-app copy avoids describing Vouch as:

- escrow
- marketplace
- broker
- scheduler
- dating app
- service directory
- provider search
- review platform
- messaging platform
- dispute platform
- arbitration tool
- payment guarantee
- safety guarantee

Preferred language:

- payment coordination
- commitment-backed workflow
- deterministic protocol
- provider-backed settlement logic
- conditional release
- bilateral confirmation
- non-discretionary execution
- outcome follows system state

## Data handling checklist

Before launch, confirm Vouch does not collect or store:

- meeting purpose
- details of what users are doing
- message content
- evidence content
- screenshots
- raw card data
- raw bank data
- raw identity documents
- raw KYC payloads
- full provider payloads
- raw Clerk payloads
- raw Stripe objects

Vouch may store only what is needed to:

- operate the platform
- verify identity where required
- process payments
- enable confirmation
- prevent fraud/abuse
- comply with legal obligations
- reconcile provider state
- maintain audit history

## Architecture checklist

Before launch, confirm:

- `app/**` is route shell only
- `features/**` owns page-level orchestration
- `components/**` is reusable UI only
- `components/ui/**` contains primitives only
- protected reads go through `lib/fetchers/*`
- writes go through `lib/actions/*`
- Stripe SDK calls live only under `lib/integrations/stripe/*`
- Clerk server access lives behind `lib/auth/*`
- authz lives behind `lib/authz/*`
- Vouch state logic lives under `lib/vouch/*`
- DTOs live in `types/*`
- DTO mappers live in `lib/dto/*`
- Zod schemas live in `schemas/*`
- provider webhooks are the only API routes
- no internal app mutation uses `/api/*`

## Required validation

Run:

`pnpm prisma:validate`

`pnpm validate:contracts`

`pnpm lint`

`pnpm typecheck`

`pnpm test`

`pnpm test:e2e`

`pnpm validate`

`pnpm validate:all`

## Launch invariant

Launch is acceptable only when:

- no layer contradicts the source of truth
- no route implies a forbidden product surface
- no UI implies discretionary judgment
- no code path enables unilateral settlement
- no provider state is treated as local assumption
- no settlement-critical operation skips provider retrieval
- no legal/copy language implies marketplace, escrow, dispute, safety guarantee, or mediation behavior
- every important transition writes safe audit state

Outcome follows system state.
