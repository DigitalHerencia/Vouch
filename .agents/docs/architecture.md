# Vouch Architecture

## Layer contract

Vouch is a production SaaS codebase with strict boundaries.

Vouch is a narrow commitment-backed payment coordination system for appointments and in-person agreements.

The architecture exists to enforce deterministic workflow state, provider-backed payment truth, bilateral confirmation, auditability, and non-discretionary settlement.

Vouch is not a marketplace, broker, scheduler, messaging app, review system, dispute-resolution system, escrow provider, discovery platform, or admin arbitration surface.

Outcome follows system state.

## Route layer

`app/**` is route shell only.

Allowed:

- route segments
- layouts
- metadata
- loading/error/not-found boundaries
- thin `page.tsx` files
- Suspense wrappers
- redirects
- params/searchParams handoff
- one page-level feature component
- external provider webhook route handlers

Forbidden:

- Prisma
- Stripe SDK
- provider business logic
- Clerk domain logic
- authz enforcement
- DTO shaping
- domain mutation
- settlement logic
- webhook reconciliation
- manual settlement override logic
- complex forms
- large hard-coded copy blocks

Route files define application surface area.

Route files do not define business truth.

## Feature layer

`features/**` owns page-level orchestration.

Feature modules may:

- call fetchers from server features
- pass DTOs into UI
- wire server actions into forms
- coordinate Suspense boundaries
- coordinate role-aware page branches
- coordinate drawers/dialogs/forms
- hold client-only state in `.client.tsx` files

Feature modules must not:

- query Prisma
- call Stripe SDKs directly
- perform provider reconciliation
- own reusable UI primitives
- become generic component libraries
- create hidden workflow rules
- create discretionary settlement behavior

Feature modules coordinate surfaces.

They do not own Vouch truth.

## Component layer

`components/**` is pure reusable UI.

Components may:

- render DTOs
- render forms
- render panels/cards/buttons
- format labels from props
- emit server-action form submissions
- use client state for UI interaction

Components must not:

- call Prisma
- call protected fetchers
- call Stripe SDK
- call Clerk server APIs
- perform authz
- mutate domain state directly
- invent hidden business rules
- decide settlement
- decide confirmation truth
- create dispute, evidence, review, messaging, or marketplace behavior

Components display state.

They do not create truth.

## UI primitives

`components/ui/**` contains low-level shadcn/Base UI primitives only.

No domain semantics.

No protected fetching.

No Vouch workflow rules.

No hidden business logic.

No Vouch-specific settlement meaning.

## Reads

Reads go through:

`lib/fetchers/*`

Protected fetcher pipeline:

- authenticate
- authorize
- minimal select
- DTO mapping
- cache policy
- transport-safe return

Protected fetchers must not return raw Prisma models, raw provider payloads, raw Clerk objects, raw Stripe objects, raw KYC data, raw card data, or raw bank data.

## Writes

Writes go through:

`lib/actions/*`

Server action pipeline:

- authenticate
- authorize
- Zod validate
- transaction/provider operation
- audit event
- revalidate
- typed result or redirect

Transactions and integrations are dependencies, not public write entry points.

Internal app mutations must not use API routes.

Client components must not call `fetch("/api/...")` for Vouch domain mutations.

## Database

Prisma schema stores durable workflow facts.

Use:

- `lib/db/selects/*`
- `lib/db/transactions/*`

The database stores facts required for deterministic payment coordination.

The database must not model marketplace behavior, messaging, disputes, evidence review, ratings, reviews, appeals, public provider profiles, service listings, manual settlement awards, or subjective resolution flows.

Do not leak raw Prisma models to UI.

Do not store:

- raw provider payloads
- raw card data
- raw bank data
- raw KYC documents
- raw identity documents
- raw Clerk payloads
- raw Stripe objects
- message content
- evidence content
- screenshots
- meeting purpose details

## DTOs

DTOs live in:

`types/*`

DTO mappers live in:

`lib/dto/*`

All Date values crossing transport boundaries are ISO strings.

All money values are integer cents plus display labels where useful.

DTOs must be transport-safe.

DTOs must not expose raw provider objects, raw Prisma records, raw Clerk objects, or sensitive provider data.

## Zod

Schemas live in:

`schemas/*`

Use Zod for:

- server action input
- form input
- route params
- search params
- provider return params
- normalized webhook envelopes after signature verification

Client-side validation is UX only.

Server-side validation is authoritative.

## Domain logic

Vouch-specific state logic lives in:

`lib/vouch/*`

Expected files:

- `lib/vouch/constants.ts`
- `lib/vouch/fees.ts`
- `lib/vouch/lifecycle.ts`
- `lib/vouch/confirmation.ts`
- `lib/vouch/resolution.ts`
- `lib/vouch/idempotency.ts`

Domain logic owns deterministic state rules.

Domain logic must enforce:

- committed Vouch immutability
- bilateral confirmation requirement
- confirmation-window constraints
- one-sided confirmation non-release
- provider-backed settlement eligibility
- no manual settlement award
- no support override
- no discretionary resolution

## Provider integrations

Stripe SDK calls live only under:

`lib/integrations/stripe/*`

Clerk server integration lives behind:

`lib/auth/*`

Authz lives behind:

`lib/authz/*`

Stripe owns payment truth.

Clerk owns authentication truth.

Vouch owns workflow truth.

Webhooks reconcile provider truth.

Provider integrations must never create marketplace, messaging, dispute, evidence, review, or manual settlement surfaces.

## API routes

Only provider webhooks are allowed:

- `app/api/clerk/webhook-handler/route.ts`
- `app/api/stripe/webhooks/route.ts`

No internal app mutation API routes.

Client components must not call `fetch("/api/...")` for Vouch domain mutations.

Webhook route handlers may verify provider signatures and delegate processing.

Webhook route handlers must not contain inline business workflow logic, inline Prisma mutations, inline settlement decisions, or app-user DTO shaping.

## Payment architecture

Vouch uses provider-backed payment coordination.

Stripe handles:

- Checkout
- payment authorization
- payment method collection
- billing details
- manual-capture PaymentIntents
- application fee processing
- Stripe Customer management
- Stripe Connect onboarding
- KYC/compliance collection
- payout banking collection
- payout execution
- provider payment state
- provider settlement state

Vouch must retrieve current Stripe provider state before settlement-critical provider operations.

Vouch must never capture, cancel, void, or refund based only on local UI state, browser redirect state, stale local database state, or unilateral participant action.

## Confirmation architecture

Presence confirmation is deterministic and bilateral.

Code generation alone means nothing.

One-sided confirmation means nothing for settlement.

Only successful bilateral verification inside the configured confirmation window changes settlement eligibility.

Confirmation may not be replaced with:

- GPS confirmation
- manual support confirmation
- screenshots
- evidence upload
- arbitration
- subjective fallback review
- admin override

## Audit

Every important transition writes an audit event.

Audit is append-only.

Audit is not a dispute system.

Audit metadata must be safe and minimal.

Participant-facing timeline receives only participant-safe audit items.

Audit must not store subjective allegations, evidence content, raw provider payloads, webhook signatures, secret metadata, or support judgment.

## Final architecture invariant

The UI can request transitions.

Server actions validate transitions.

Transactions persist transitions.

Integrations retrieve provider truth.

Webhooks reconcile provider truth.

Audit records the deterministic story.

No layer may introduce discretionary settlement.

Outcome follows system state.
