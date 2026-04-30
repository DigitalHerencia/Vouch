# AGENTS.md

## Project: Vouch

Vouch is a SaaS tool for commitment-backed payment coordination for registered,
verified users with their own pre-arranged appointments or in-person agreements.

Core rule:

> Both parties confirm presence within the confirmation window → funds release.
> Otherwise → refund, void, or non-capture.

Vouch is intentionally narrow.

It is **not**:

- a marketplace
- a booking marketplace
- a discovery platform
- a messaging app
- a review/rating system
- a dispute-resolution system
- an escrow provider
- a broker
- a scheduler
- a social platform

Do not add features that move the product toward any of those categories.

Stripe terminology note:

- Stripe product selection: "Build a platform or marketplace" means Vouch needs
  Connect, connected accounts, and payouts.
- Vouch business description: "Vouch is not a marketplace" means Vouch does not
  provide discovery, listings, public profiles, matching, reviews, or booking.
- Use "SaaS tool" and "payment coordination" language in Stripe description
  boxes and product copy.

---

## 1. Source of Truth Order

When implementing or refactoring, obey this order:

1. `.agents/docs/*.md`
   Human intent layer.

2. `.agents/contracts/*.yaml`
   Deterministic machine-readable contracts.

3. `.agents/instructions/*.instructions.md`
   Domain implementation instructions.

4. Existing repo code.

5. Agent judgment.

If code conflicts with contracts, the contracts win.

If contracts conflict with docs, stop and report the inconsistency before inventing behavior.

Never implement behavior that contradicts:

- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/acceptance-gates.yaml`

---

## 2. Current Contract Files

The repo expects these governance files:

```txt
.agents/
  contracts/
    acceptance-gates.yaml
    analytics.yaml
    authz.yaml
    domain-model.yaml
    features.yaml
    roles.yaml
    routes.yaml
  docs/
    design-system.md
    launch-copy.md
    prd.md
    source-normalization.md
    tech-requirements.md
    user-flows.md
  execution/
    backlog.json
    decisions.json
    handoff.json
    progress.json
    validation.json
  instructions/
    admin-moderation.instructions.md
    auth.instructions.md
    booking.instructions.md
    database-prisma.instructions.md
    discovery.instructions.md
    guest-inbox.instructions.md
    host-dashboard.instructions.md
    host-onboarding.instructions.md
    host-profile.instructions.md
    shared-components.instructions.md
```

For Vouch, legacy instruction filenames may be renamed later. Until then, use the contracts as authoritative.

---

## 3. Core Product Invariants

These are non-negotiable.

### 3.1 No Product Marketplace

Do not create:

- public provider profiles
- public client profiles
- service listings
- browse/discover/search pages
- categories
- recommendations
- featured providers
- ratings
- reviews
- reputation scores
- “book now” marketplace flows

Forbidden route examples:

```txt
/browse
/providers
/messages
/reviews
/categories
/disputes
```

### 3.2 No Arbitration

Do not create:

- dispute cases
- claims
- evidence uploads
- appeal workflows
- manual fund-award actions
- admin judgment screens
- “who was right?” flows

Admins may inspect operational state.
Admins may not decide who deserves funds.

### 3.3 No Direct Custody

Do not design Vouch as holding user funds directly.

Payment state must be represented as provider-backed records and references.

Never store:

- raw card data
- raw identity documents
- full payment provider payloads
- unnecessary payment secrets

### 3.4 Dual Confirmation Required

Funds release only when:

- Vouch is active
- payer confirmed within the confirmation window
- payee confirmed within the confirmation window
- payment provider release/capture/transfer succeeds or is provider-accepted

One-sided confirmation never releases funds.

### 3.5 Default Refund / Void / Non-Capture

If both confirmations are not completed before expiration:

- do not release funds
- trigger refund, void, or non-capture according to payment provider flow
- record the outcome
- write audit events
- notify both parties

---

## 4. Tech Stack

Use the repo’s current package versions unless explicitly instructed otherwise.

Expected stack:

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Clerk Auth
- Stripe / Stripe Connect
- Tailwind CSS
- Radix UI / shadcn-style components
- React Hook Form
- Zod
- Vitest
- Playwright
- pnpm

Default package manager:

```bash
pnpm
```

Do not switch package managers.

---

## 5. Architecture Rules

This repo uses a server-first architecture.

```txt
app/                    route shell only
features/               page/view orchestration
components/             pure reusable UI
lib/<domain>/fetchers/  server reads
lib/<domain>/actions/   server mutations
lib/auth/               auth helpers
lib/authz/              authorization policies/helpers
schemas/                runtime validation
types/                  DTOs and transport-safe contracts
prisma/                 database schema, migrations, seed
```

### 5.1 `app/` Rules

`app/` may contain:

- route segments
- layouts
- loading boundaries
- error boundaries
- not-found boundaries
- thin `page.tsx`
- route handlers for webhooks/API boundaries

`app/` must not contain:

- raw Prisma queries
- payment logic
- authz logic
- business state machines
- complex form logic
- reusable domain logic

Pages should be thin:

```tsx
export default async function Page(props) {
  return <SomeFeatureBlock {...props} />
}
```

### 5.2 `features/` Rules

`features/` owns orchestration:

- server component blocks
- client form containers
- Suspense placement
- action wiring
- URL/search-param state
- mapping action errors into forms
- page-specific composition

Feature code may call:

- fetchers
- actions
- schemas
- pure UI components

Feature code must not bypass server authz.

### 5.3 `components/` Rules

`components/` owns pure UI only.

Components may receive:

- DTOs
- view models
- callbacks
- form objects
- display props

Components must not:

- call Prisma
- call Stripe
- call Clerk server APIs
- enforce authorization
- mutate domain state
- hide business logic
- fetch protected data

### 5.4 `lib/<domain>/fetchers/` Rules

Fetchers own server reads.

Every protected fetcher must:

1. authenticate
2. authorize
3. query with minimal select
4. map to DTO/read model
5. apply cache policy intentionally
6. return transport-safe data

Never return raw Prisma objects deep into UI.

### 5.5 `lib/<domain>/actions/` Rules

Server actions own mutations.

Every server action must:

1. authenticate
2. authorize
3. validate input with Zod
4. execute transaction/provider operation
5. write audit event
6. revalidate relevant cache tags/paths
7. return typed result or redirect

Never trust client-side validation.

---

## 6. Domain Model Requirements

Core entities expected from contracts:

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

Forbidden entities:

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

Do not create forbidden entities under different names.

---

## 7. Vouch Lifecycle

Allowed human-readable states:

```txt
pending
active
completed
expired
refunded
canceled
failed
```

Expected transitions:

```txt
pending -> active       when payee accepts
pending -> canceled     when payer/system cancels before acceptance
pending -> expired      when acceptance/confirmation deadline passes
active  -> completed    when both parties confirm in window and payment releases
active  -> expired      when window passes without both confirmations
expired -> refunded     when refund/void/non-capture completes
pending -> failed       on technical/provider failure
active  -> failed       on technical/provider failure
```

Do not add new lifecycle states without updating contracts.

---

## 8. Authorization Rules

Use `.agents/contracts/authz.yaml`.

Deny by default.

A user may access a Vouch only if they are:

- payer
- accepted payee
- valid invite candidate with token-limited summary access
- admin

A user may confirm only if:

- authenticated
- active
- participant
- Vouch is active
- confirmation window is open
- they have not already confirmed

A payer may not accept their own Vouch.

Admin may inspect operational state only.
Admin may not arbitrate.

---

## 9. Route Rules

Use `.agents/contracts/routes.yaml`.

Expected core routes:

```txt
/
 /how-it-works
 /pricing
 /faq
 /legal/terms
 /legal/privacy
 /sign-in
 /sign-up
 /dashboard
 /setup
 /settings
 /settings/payment
 /settings/payout
 /settings/verification
 /vouches
 /vouches/new
 /vouches/[vouchId]
 /vouches/[vouchId]/confirm
 /vouches/invite/[token]
 /admin
 /admin/vouches
 /admin/vouches/[vouchId]
 /admin/users
 /admin/payments
 /admin/audit
 /api/webhooks/stripe
 /api/webhooks/clerk
```

Do not add forbidden marketplace/dispute routes.

---

## 10. Feature Scope

MVP features:

- marketing landing
- legal pages
- auth sign-in/sign-up
- setup checklist
- verification setup
- payment setup
- payout setup
- dashboard
- Vouch list
- create Vouch
- invite/share Vouch
- accept Vouch
- decline Vouch
- Vouch detail
- manual confirmation
- deterministic expiration/refund
- Stripe webhook reconciliation
- Clerk webhook sync
- lifecycle notifications
- admin operational views
- audit trail

Deferred features:

- GPS confirmation
- recurring Vouches
- group Vouches
- API access
- calendar integrations
- SMS notifications
- native mobile apps

Do not implement deferred features unless explicitly requested.

---

## 11. Payment Rules

Payment implementation must:

- use Stripe / Stripe Connect or equivalent
- store provider references, not raw payment details
- verify webhooks
- handle idempotency
- reconcile provider state server-side
- write audit events
- expose only safe payment summaries to users

Never trust client-reported payment status.

Never expose provider secrets to the browser.

Payment copy must not claim legal escrow status unless legal review explicitly approves it.

---

## 12. Webhook Rules

Webhook route handlers may live in `app/api/.../route.ts`.

Webhook business logic must delegate to `lib/payments/` or equivalent.

Every webhook handler must:

1. read raw request body if provider requires it
2. verify provider signature
3. record provider event ID
4. ignore duplicates idempotently
5. process transactionally
6. write audit event
7. return correct provider response

Webhook handlers must not perform unsafe non-idempotent side effects.

---

## 13. Forms and Validation

Use:

- React Hook Form for client form UX
- Zod for schemas
- server actions for authority

Client validation is convenience only.

Server validation is mandatory.

Action result shape should be consistent:

```ts
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      formError?: string
      fieldErrors?: Record<string, string[]>
      code?: string
    }
```

Map server errors back into forms at feature level.

---

## 14. DTO / View Model Rules

Do not pass raw database records deep into components.

Use DTOs/read models such as:

```ts
type VouchListItem = {
  id: string
  publicId: string
  role: "payer" | "payee"
  status: VouchStatus
  amountCents: number
  currency: string
  otherPartyLabel: string | null
  confirmationExpiresAt: string
  nextAction: string | null
}
```

Rules:

- DTO timestamps should be strings unless there is a strong reason otherwise.
- Components receive only fields they render.
- Sensitive provider metadata stays server-side/admin-only.

---

## 15. Caching Rules

Caching belongs in fetchers.

Use dynamic/no-store for:

- Vouch detail
- dashboard
- payment status
- verification status
- admin views
- confirmation state

Static/revalidated is acceptable for:

- marketing pages
- legal pages
- public copy
- low-risk reference content

Suggested cache tags:

```txt
vouches
vouch:{vouchId}
user:{userId}:vouches
payments
payment:{paymentId}
verification:{userId}
admin:vouches
audit:vouch:{vouchId}
```

Mutations must revalidate relevant tags/paths.

Do not scatter cache invalidation randomly through UI components.

---

## 16. UI / Design Rules

The product should feel:

- serious
- precise
- neutral
- professional
- secure
- fast
- clear

Avoid:

- playful payment language
- social app patterns
- gamification
- marketplace visuals
- provider directory patterns
- review prompts
- chat UI

Every Vouch screen must answer:

1. What is the current status?
2. What amount is involved?
3. What do I need to do?
4. When do I need to do it?
5. What happens if I do nothing?
6. Has the other party acted?
7. Is this final?

Use clear status badges with text, not color alone.

---

## 17. Copy Rules

Use:

- “commitment-backed payment”
- “confirm presence”
- “release funds”
- “refund”
- “appointment”
- “in-person agreement”
- “no-show protection”
- “both parties”

Avoid:

- “escrow”
- “safe meetup”
- “trusted provider”
- “verified service”
- “guaranteed appointment”
- “dispute”
- “claim”
- “judge”
- “marketplace”
- “review”
- “rating”

Approved core explanation:

> One person creates a Vouch and commits funds. The other accepts. When the meeting happens, both parties confirm. If both confirm in time, funds release. If confirmation does not complete, the payment is refunded or not captured.

---

## 18. Testing Requirements

Use:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm prisma:validate
pnpm validate:contracts
```

Run only what is relevant while working, but before reporting completion, run the strongest practical validation set.

Minimum tests expected:

### Unit / Vitest

- schemas
- authz helpers
- state transitions
- fee calculations
- DTO mappers
- webhook idempotency helpers

### Integration

- server actions
- fetchers
- payment service adapters with mocks
- webhook processing
- audit creation

### E2E / Playwright

- sign-in/auth smoke
- create Vouch
- accept Vouch
- both parties confirm
- incomplete confirmation expires/refunds
- unrelated user blocked
- admin route blocked for non-admin

Do not claim tests passed unless they were actually run.

---

## 19. Acceptance Gates

Before marking work complete, check `.agents/contracts/acceptance-gates.yaml`.

Critical gates include:

- contract integrity
- domain model integrity
- no marketplace surface
- no arbitration surface
- no platform custody
- auth enforcement
- setup gates
- Vouch create flow
- Vouch accept flow
- manual confirmation flow
- deterministic resolution
- webhook idempotency
- route access control
- audit events

If a gate cannot be validated, report it explicitly.

---

## 20. Execution Logging

When making substantive changes, update execution JSON where appropriate:

```txt
.agents/execution/backlog.json
.agents/execution/decisions.json
.agents/execution/handoff.json
.agents/execution/progress.json
.agents/execution/validation.json
```

Rules:

- `progress.json` records what changed.
- `decisions.json` records architectural/product decisions.
- `validation.json` records checks run and results.
- `handoff.json` records remaining work, risks, and next steps.
- `backlog.json` records outstanding tasks.

Do not store business logic in execution JSON.

Do not treat execution JSON as source of truth over contracts.

---

## 21. Task Workflow for Codex

For each task:

1. Read this file.
2. Read relevant `.agents/docs/*.md`.
3. Read relevant `.agents/contracts/*.yaml`.
4. Inspect existing code before editing.
5. Identify affected routes/features/lib modules.
6. Make the smallest coherent change.
7. Add/update tests where needed.
8. Run relevant validation.
9. Update execution logs if appropriate.
10. Summarize:

- files changed
- behavior implemented
- validation run
- risks / follow-ups

Do not perform broad rewrites unless explicitly requested.

Do not introduce speculative abstractions.

Do not add dependencies unless necessary and justified.

---

## 22. Implementation Standards

### TypeScript

- Use strict types.
- Avoid `any`.
- Prefer discriminated unions for domain states.
- Keep provider payloads behind adapter boundaries.
- Use exhaustive checks for lifecycle states.

### Prisma

- Keep schema aligned with `domain-model.yaml`.
- Add indexes for:
  - participant Vouch lookup
  - invite token hash
  - provider event ID
  - status/deadline queries
  - audit entity lookup

- Do not store raw card data or raw identity documents.
- Use transactions for multi-entity state transitions.

### Server Actions

Action files should be domain-specific.

Example:

```txt
lib/vouches/actions/create-vouch.ts
lib/vouches/actions/accept-vouch.ts
lib/vouches/actions/confirm-presence.ts
lib/payments/actions/start-payment-setup.ts
```

Each action must validate, authorize, mutate, audit, and revalidate.

### Fetchers

Fetcher files should be domain-specific.

Example:

```txt
lib/vouches/fetchers/get-vouch-detail.ts
lib/vouches/fetchers/list-user-vouches.ts
lib/admin/fetchers/list-operational-vouches.ts
```

Each protected fetcher must authorize access.

### Schemas

Use domain schema files.

Example:

```txt
schemas/vouches/create-vouch.schema.ts
schemas/vouches/accept-vouch.schema.ts
schemas/vouches/confirm-presence.schema.ts
```

### Components

Use pure components.

Example:

```txt
components/vouches/vouch-card.tsx
components/vouches/vouch-status-badge.tsx
components/vouches/confirmation-panel.tsx
components/payments/payment-summary.tsx
components/setup/setup-checklist.tsx
```

---

## 23. Security Rules

Never expose secrets.

Never trust:

- hidden inputs
- client state
- client-reported role
- client-reported payment status
- client-reported confirmation eligibility

Always verify:

- current user
- participant relationship
- Vouch state
- confirmation window
- payment provider state
- webhook signatures

Protect against:

- IDOR
- duplicate webhook processing
- duplicate confirmation
- self-acceptance
- unrelated Vouch access
- unsafe admin actions

---

## 24. Error Handling

Use route-level boundaries:

```txt
error.tsx
not-found.tsx
global-error.tsx
loading.tsx
```

Use typed server action errors.

Payment errors must:

- log safe details
- write audit event
- show safe user copy
- expose operational detail only to admin

Do not leak provider secrets or raw provider payloads to users.

---

## 25. Admin Surface Rules

Admin is for operational diagnosis.

Admin may show:

- users
- Vouches
- payment records
- refund records
- webhook events
- audit events
- notification events
- failure states

Admin may safely retry idempotent technical operations if implemented.

Admin must not show:

- “award funds”
- “resolve dispute”
- “decide winner”
- “override confirmation”
- “edit confirmation”
- “force complete without both confirmations”

---

## 26. Analytics Rules

Use `.agents/contracts/analytics.yaml`.

Track lifecycle and funnel events.

Do not track:

- raw card data
- raw identity documents
- full provider payloads
- precise location history
- detailed meeting purpose
- private messages
- review text
- service categories

Do not add analytics for prohibited marketplace behavior.

---

## 27. Development Commands

Use these commands when available:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm prisma:generate
pnpm prisma:validate
pnpm db:push
pnpm db:migrate
pnpm db:seed
pnpm validate:contracts
```

Before final completion, prefer:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
pnpm validate:contracts
```

For E2E-impacting changes, also run:

```bash
pnpm test:e2e
```

---

## 28. Reporting Format

When finished, report in this format:

```md
## Summary

- ...

## Files Changed

- `path/to/file`
- `path/to/file`

## Validation

- `pnpm lint` — pass/fail/not run
- `pnpm typecheck` — pass/fail/not run
- `pnpm test` — pass/fail/not run
- `pnpm prisma:validate` — pass/fail/not run
- `pnpm validate:contracts` — pass/fail/not run

## Contract Gates Checked

- ...

## Risks / Follow-Ups

- ...
```

Do not say validation passed unless it was actually run.

Do not hide failures.

Do not invent implementation details.

---

## 29. Stop Conditions

Stop and report before continuing if:

- requested work contradicts contracts
- implementation would create marketplace behavior
- implementation would create arbitration behavior
- payment flow requires legal/compliance decision not encoded in contracts
- Stripe/Connect behavior is ambiguous and affects custody/release semantics
- a migration may destroy data
- tests fail for reasons unrelated to the current task and cannot be safely fixed
- required environment variables are missing
- the task requires secrets not available in the repo

---

## 30. Final Rule

The product is Vouch.

The product is not a marketplace.

The product is not a judge.

The product is not escrow.

The product is the narrow commitment layer:

> create → accept → both confirm → release
> otherwise → refund / void / non-capture

```
::contentReference[oaicite:1]{index=1}
```

[1]: https://developers.openai.com/codex/guides/agents-md?utm_source=chatgpt.com "Custom instructions with AGENTS.md – Codex"
