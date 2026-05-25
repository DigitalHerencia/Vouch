# AGENTS.md

Project: Vouch
Authority: repository-level agent operating contract
Purpose: implementation, audit, validation, and source-artifact maintenance for the Vouch MVP.

## 1. Product Invariant

Vouch is deterministic payment coordination infrastructure for real-world commitments.

Core rule:

```txt
Both participants confirm presence inside the confirmation window
-> retrieve current Stripe provider state
-> capture the manual-capture PaymentIntent if Stripe says it is capturable
-> settlement proceeds through Stripe Connect.

Anything else
-> do not capture
-> cancel, expire, non-capture, or refund only according to provider state.
```

Vouch does not decide fault, honesty, service quality, legal correctness, intent, or blame. Vouch determines whether protocol conditions were satisfied. Outcome follows system state.

## 2. Forbidden Product Surfaces

Do not add, imply, scaffold, test, route, copywrite, or model:

```txt
marketplace
brokerage
scheduler
messaging
chat
public profiles
provider discovery
service listings
categories
search or browse providers
ratings
reviews
disputes
claims
appeals
evidence uploads
screenshots as proof
manual settlement
manual release
manual refund award
support arbitration
admin outcome decision
manual confirmation rewrite
force release
force refund
alternate payout rail
```

If a request implies a forbidden surface, stop and report the conflict. Do not rename the surface and implement it anyway.

## 3. Authority Order

When sources conflict, use this order:

1. `.agents/contracts/*.yaml` and `.agents/contracts/*.yml`
2. `.agents/docs/*.md`
3. `.agents/instructions/*.md`
4. `.agents/execution/*.json`
5. Existing repository code
6. Agent judgment

Contracts beat code. Contract conflicts in docs must be reported before implementation. Provider documentation beats stale local assumptions.

## 4. Provider Authority Model

```txt
Clerk owns authentication truth.
Stripe owns payment truth.
Vouch owns workflow truth.
Webhooks reconcile provider truth.
Outcome follows system state.
```

Never treat browser return URLs, local optimistic UI state, stale database mirrors, or user claims as payment truth.

## 5. Stack Contract

Use TypeScript, Next.js App Router, React Server Components, Prisma, PostgreSQL/Neon, Clerk, Stripe Connect, Zod, React Hook Form, Tailwind, shadcn/Base UI-compatible primitives, Vitest, Playwright, pnpm, and Vercel.

Do not switch framework, ORM, provider, package manager, UI primitive strategy, or deployment target unless explicitly requested.

## 6. File Ownership Model

Each file has one primary architectural role.

```txt
app/**                       route shell only
features/**                  route-level orchestration
components/blocks/**         reusable presentation assemblies
components/**                pure UI renderers
components/ui/**             primitive controls only
content/**                   static reusable content
lib/actions/**               user-triggered protected writes
lib/fetchers/**              protected reads
lib/webhooks/**              provider webhook orchestration
lib/processors/**            server-only non-user orchestration
lib/auth/**                  authentication context and local user lookup
lib/authz/**                 authorization, capability, participant checks
lib/db/client.ts             server-only Prisma client
lib/db/selects/**            minimal persistence read shapes
lib/db/transactions/**       atomic persistence mutation mechanics
lib/dto/** or lib/mappers/** persistence/provider-to-DTO mapping
lib/integrations/**          external SDK adaptation
lib/vouch/**                 deterministic Vouch domain rules
schemas/**                   Zod validation
types/**                     transport-safe contracts
tests/**                     validation
.agents/**                   agent governance and execution artifacts
```

## 7. App Router Rules

`app/**` files are route shells. They may define metadata, layout selection, thin pages, route boundaries, Suspense fallback selection, params/searchParams handoff, redirects, and provider webhook ingress.

They must not contain Prisma queries, Stripe SDK calls, provider business logic, Clerk domain logic, authz implementation, DTO shaping, domain mutation, settlement logic, complex form state, or long repeated copy blocks.

## 8. Feature and UI Rules

`features/**` orchestrates route-level behavior. It may call fetchers, hand off server actions, branch on DTO state, coordinate Suspense, and compose blocks/components. It must not query Prisma, call provider SDKs, reconcile provider state, or own settlement rules.

`components/**` renders pure UI from props. `components/ui/**` contains primitives only and must not contain Vouch domain language, business rules, provider calls, auth/authz, or protected data.

Form components may own React Hook Form wiring and client validation UX. Server validation remains authoritative.

## 9. Read Pipeline

Every protected fetcher follows:

```txt
authenticate
-> authorize
-> minimal select
-> map to DTO
-> cache policy
-> transport-safe return
```

Fetchers must not mutate state, call actions, reconcile providers, return raw Prisma records, or return raw Stripe/Clerk objects.

## 10. Write Pipeline

Every server action follows:

```txt
authenticate
-> authorize
-> Zod validate
-> transaction/provider operation
-> audit event
-> revalidate/redirect
-> typed result
```

Actions must not return raw provider or Prisma objects, skip authz, trust client-calculated fees, trust browser return URLs, implement manual settlement, or use internal `/api/*` routes for app mutations.

## 11. Webhook Pipeline

Webhook route handlers live only under:

```txt
app/api/clerk/webhooks/route.ts
app/api/stripe/webhooks/route.ts
```

Webhook processing follows:

```txt
read raw body
-> verify signature
-> parse event envelope
-> classify event type
-> record provider event ID
-> process idempotently
-> reconcile only valid forward movement
-> write audit event if transition occurred
-> provider-compatible response
```

Webhook routes must delegate business logic to `lib/webhooks/**` or `lib/processors/**`.

## 12. State Model

Use exactly these Vouch lifecycle values:

```txt
draft
committed
sent
accepted
authorized
confirmable
completed
expired
```

`completed` and `expired` are terminal. `committed` and later are immutable except for allowed forward lifecycle transitions.

Do not put provider/payment/operational states in `VouchStatus`. These belong to separate axes:

```txt
paymentStatus
settlementStatus
archiveStatus
recoveryStatus
webhookStatus
```

Forbidden lifecycle values:

```txt
pending
active
refunded
canceled
failed
voided
settled
provider_restricted
archived
```

## 13. Roles and Confirmation

Canonical participant roles:

```txt
merchant
customer
```

Roles are scoped to a Vouch, not global account types.

Allowed confirmation methods:

```txt
code_exchange
offline_code_exchange
```

Forbidden methods:

```txt
gps
manual
system
admin
support
screenshot
evidence
```

Each participant may confirm once. Duplicate confirmation must be rejected transactionally. One-sided confirmation never releases funds.

## 14. Stripe Rules

All Stripe SDK calls live under `lib/integrations/stripe/**`.

Vouch uses two separate Stripe flows:

1. Merchant protocol fee: platform-owned Checkout Session or PaymentIntent, non-refundable by default, not a Connect destination charge.
2. Customer protected amount: Stripe Checkout Session that creates/confirms a manual-capture PaymentIntent for only the protected amount.

The customer authorization surface is a Stripe Checkout Session URL. Do not use reusable Stripe Payment Links as the canonical authorization link.

Before capture, cancel, refund, retry, or settlement reconciliation, retrieve current Stripe state. Capture/cancel/refund operations require durable idempotency keys.

Do not use the customer PaymentIntent to collect the merchant fee. Do not use `application_fee_amount` as the merchant's upfront protocol fee.

## 15. Clerk Rules

Clerk owns authentication truth. Vouch DB owns product readiness and terms acceptance. Clerk metadata must not be the only source of Vouch terms acceptance. Do not store raw Clerk payloads.

## 16. Audit Rules

Audit is an append-only ledger of deterministic system facts. Audit is not a dispute system and is not participant-facing by default.

Every important transition writes an audit event. Critical audit events should be written in the same transaction as the state change when possible.

Do not store raw provider payloads, webhook signatures, raw card/bank/KYC data, identity documents, message content, evidence content, screenshots, allegations, or support judgment in audit metadata.

## 17. Route Contract

Canonical routes:

```txt
/
/pricing
/faq
/legal/terms
/legal/privacy
/checkout/success
/sign-in
/sign-up
/dashboard
/vouches/new
/vouches/new/confirm
/vouches/[vouchId]
/api/clerk/webhooks
/api/stripe/webhooks
```

Do not create internal product routes for setup, settings, account, profile, readiness, admin settlement, messages, disputes, claims, appeals, evidence, reviews, ratings, search, browse, providers, or marketplace.

Connect and payment management must use Stripe-hosted flows through server actions.

## 18. Validation

Use scope-appropriate validation:

```txt
pnpm validate:contracts
pnpm prisma:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate
pnpm validate:all
```

Never claim validation ran unless it ran. If scripts are unavailable, report that exactly.

## 19. Shipping Definition

The MVP ships when this loop works securely:

```txt
merchant signs up
merchant accepts terms
merchant completes Stripe Connect readiness
merchant creates Vouch draft
merchant pays protocol fee
Vouch commits and becomes immutable
merchant obtains authorization link
customer signs up or signs in
customer accepts terms
customer authorizes manual-capture PaymentIntent
confirmation window opens
merchant confirms with customer code
customer confirms with merchant code
server locks bilateral confirmation
server retrieves Stripe provider state
server captures idempotently if capturable
Stripe Connect settlement proceeds
Vouch records audit events
dashboard/detail reflect final state
```

## 20. Final Agent Rule

Do not widen the product. Do not invent human judgment surfaces. Do not move money from stories. Move money only from protocol truth plus provider truth.

