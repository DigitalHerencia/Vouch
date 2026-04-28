# Vouch Technical Requirements

## 1. Purpose

This document defines the technical requirements for building Vouch as a production-grade, server-first web application.

The system must support deterministic payment coordination, identity-gated participation, Vouch lifecycle state transitions, dual confirmation, release/refund resolution, auditability, and a narrow legal/compliance surface.

## 2. Architectural Principle

Vouch must use a server-first architecture.

The browser may render UI, collect input, and request actions.

The server owns:

- authentication
- authorization
- validation
- payment state
- Vouch state
- confirmation rules
- release/refund decisions
- audit events
- database writes
- cache invalidation

Client components must never be trusted as the source of truth.

## 3. Stack Baseline

The implementation should align with the provided package baseline.

Core stack:

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Clerk authentication
- Stripe / Stripe Connect
- Tailwind CSS
- Radix UI / shadcn-style primitives
- React Hook Form
- Zod
- Vitest
- Playwright
- pnpm

Version alignment should follow the current repository package file unless intentionally changed through an explicit dependency decision.

## 4. Required Application Layers

### 4.1 `app/`

Route shell only.

Responsibilities:

- route segments
- layouts
- loading boundaries
- error boundaries
- not-found boundaries
- thin page files
- route handlers only where needed

`app/` must not contain:

- raw Prisma queries
- business logic
- payment logic
- authorization logic
- complex form logic
- reusable domain logic

### 4.2 `features/`

Feature orchestration layer.

Responsibilities:

- page-level composition
- server component blocks
- client form containers
- Suspense boundaries
- loading skeleton placement
- URL/search-param parsing handoff
- interaction wiring
- action result mapping

Feature code may call fetchers and actions.

Feature code must not bypass server-side authorization or validation.

### 4.3 `components/`

Reusable UI layer.

Responsibilities:

- pure presentational UI
- cards
- tables
- buttons
- dialogs
- forms field groups
- status badges
- skeletons
- layout primitives

Components must not:

- call Prisma
- call Stripe
- enforce authorization
- own domain state transitions
- parse database objects directly
- contain hidden business rules

### 4.4 `lib/<domain>/fetchers/`

Server read layer.

Responsibilities:

- authenticated reads
- authorized reads
- database query composition
- DTO shaping
- cache policy
- cache tags
- read model construction

Fetchers must return transport-safe read models.

Fetchers must not return raw Prisma objects unless explicitly safe and internal.

### 4.5 `lib/<domain>/actions/`

Server mutation layer.

Responsibilities:

- authenticate user
- authorize user
- parse input with Zod
- execute database transactions
- call Stripe/payment APIs
- write audit events
- update state
- revalidate tags/paths
- return typed action results

Every mutation must live here unless it is a webhook route handler.

### 4.6 `lib/auth/`

Authentication integration layer.

Responsibilities:

- current user resolution
- session handling
- Clerk user mapping
- required-auth helpers
- account status helpers

### 4.7 `lib/authz/`

Authorization layer.

Responsibilities:

- role/capability checks
- ownership checks
- Vouch participant checks
- admin checks
- policy helpers

Authorization must be enforced server-side in every protected fetcher and action.

### 4.8 `schemas/`

Runtime validation layer.

Responsibilities:

- create Vouch input schema
- accept Vouch input schema
- confirm presence input schema
- payment setup schema
- profile/account schema
- admin filter schema

Zod schemas must be reused by client UX where helpful, but server actions remain authoritative.

### 4.9 `types/`

Transport-safe TypeScript contracts.

Responsibilities:

- DTOs
- read models
- action results
- discriminated union status types
- user-facing state models

Types must not expose internal-only payment provider details unless intended.

### 4.10 `prisma/`

Database schema and migrations.

Responsibilities:

- canonical persistence model
- relational integrity
- migration history
- seed data

Prisma schema must reflect YAML contract definitions once contracts are created.

## 5. Server Action Standard

Every server action must follow this sequence:

1. authenticate
2. authorize
3. validate input
4. execute transaction or provider operation
5. write audit event
6. revalidate relevant cache tags or paths
7. return typed success/error result or redirect

Server actions must not:

- trust client-side validation
- accept arbitrary JSON without parsing
- leak provider secrets
- return raw provider payloads to the client
- silently swallow payment failures
- mutate payment state without audit logs
- perform unrelated domain operations in a single action

## 6. Fetcher Standard

Every protected fetcher must:

1. authenticate
2. authorize
3. query with minimal select
4. map to DTO/read model
5. apply cache policy intentionally
6. return only what the consuming feature needs

Fetchers must not:

- expose private fields
- overfetch payment metadata
- skip participant checks
- rely on UI route guards
- perform writes

## 7. Domain Modules

Recommended initial domain folders:

```
lib/
  auth/
  authz/
  users/
  vouches/
  payments/
  verification/
  notifications/
  admin/
  audit/
```

Recommended feature folders:

```
features/
  marketing/
  dashboard/
  vouches/
  verification/
  payments/
  account/
  admin/
```

Recommended component folders:

```
components/
  ui/
  layout/
  vouches/
  payments/
  verification/
  admin/
  forms/
```

## 8. Data Requirements

### 8.1 Core Entities

The system must persist:

- User
- VerificationProfile
- PaymentCustomer
- ConnectedAccount
- Vouch
- VouchParticipant
- PresenceConfirmation
- PaymentIntent or PaymentRecord
- RefundRecord
- PlatformFeeRecord
- AuditEvent
- NotificationEvent
- TermsAcceptance

### 8.2 Core Relationships

A Vouch must reference:

- payer user
- payee user when accepted
- payment record
- confirmation records
- lifecycle status
- scheduled/valid time window
- audit events

A user may have:

- many created Vouches
- many accepted Vouches
- one verification profile
- one or more payment provider references
- many audit events

### 8.3 Data Safety

The database must not store unnecessary sensitive information.

Do not store:

- raw identity documents
- raw card data
- unnecessary location history
- open-ended meeting purpose descriptions
- private messages

Store only provider references, status flags, timestamps, and audit-safe metadata.

## 9. Vouch Lifecycle Requirements

The system must support deterministic state transitions.

Human-readable lifecycle:

```
Pending → Active → Completed
Pending → Canceled
Pending → Expired/Refunded
Active → Completed
Active → Expired/Refunded
Any payment-bearing state → Failed when provider operation fails
```

Rules:

- Pending means created but not accepted.
- Active means accepted and awaiting confirmation/resolution.
- Completed means both users confirmed and funds released.
- Expired means required confirmation did not occur in time.
- Refunded means funds returned or capture avoided.
- Failed means technical/payment failure requires system recovery.

State transitions must be validated server-side.

No client component may directly choose a final state.

## 10. Payment Requirements

Payment processing must use Stripe or equivalent provider-supported flows.

The system must:

- create payment records
- track provider payment IDs
- track provider customer IDs
- track connected account IDs
- track amount
- track currency
- track platform fee
- track payment status
- handle release/capture/transfer/refund
- handle provider failures
- receive and verify webhooks
- reconcile webhook events with local state

The platform must not directly custody funds.

Payment flows must be reviewed before production launch to ensure the implementation matches product/legal positioning.

## 11. Stripe / Webhook Requirements

Webhook handlers must:

- verify signatures
- reject invalid payloads
- be idempotent
- persist event IDs
- avoid duplicate processing
- update local records transactionally
- never trust client-reported payment status

Webhook event handling should write AuditEvent records.

Webhook route handlers may live in `app/api/.../route.ts`, but business logic must delegate into `lib/payments/`.

## 12. Verification Requirements

The system must track whether a user is eligible to participate in payment-bearing flows.

Verification statuses should include:

- unstarted
- pending
- verified
- rejected
- requires_action
- expired

Verification gates:

- creating Vouch may require payer eligibility
- accepting Vouch may require payee eligibility
- receiving funds requires payout readiness
- confirming may require both account and Vouch eligibility

Exact rules must be reflected in contracts.

## 13. Authorization Requirements

A user may access a Vouch only if they are:

- the payer
- the accepted payee
- an invited recipient before acceptance where invite rules allow
- an authorized admin

A user may confirm a Vouch only if they are a participant.

A user may accept a Vouch only if:

- the Vouch is pending
- the invite token or recipient constraint matches
- the user is eligible
- no other payee has accepted it

A user may view admin screens only if they have admin role/capability.

## 14. Caching Requirements

Caching must be intentional and owned by fetchers.

### Cacheable

- marketing content
- public landing content
- static legal pages
- low-sensitivity reference data

### Dynamic or Short-Lived

- Vouch detail
- dashboard
- payment status
- verification status
- admin operational views
- confirmation state

### Cache Tags

Recommended tags:

```
vouches
vouch:{vouchId}
user:{userId}:vouches
payments
payment:{paymentId}
verification:{userId}
admin:vouches
audit:vouch:{vouchId}
```

Mutations must invalidate relevant tags or paths.

## 15. URL State Requirements

List pages should use URL search params for:

- filters
- status tabs
- sorting
- pagination

Examples:

- dashboard Vouch list
- admin Vouch list
- audit/event list

Search params must be parsed and normalized in feature-level helpers or schemas before reaching fetchers.

## 16. Form Requirements

Forms should use:

- React Hook Form for client-side ergonomics
- Zod resolver for client-side feedback
- server actions for authoritative validation and mutation

Forms must support:

- pending state
- field-level errors
- form-level errors
- disabled unsafe submit states
- accessibility labels
- clear success/failure behavior

Forms must not:

- encode final business decisions client-side
- trust hidden inputs for sensitive values
- perform payment resolution without server action/provider confirmation

## 17. Error Handling Requirements

### Route Errors

Use:

- `error.tsx` for recoverable route segment errors
- `not-found.tsx` for missing Vouches/users
- `global-error.tsx` for catastrophic failures

### Action Errors

Standard action result shape:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      formError?: string
      fieldErrors?: Record<string, string[]>
      code?: string
    }
```

### Payment Errors

Payment errors must:

- be logged
- be visible in admin views
- show safe user-facing copy
- never expose provider secrets
- preserve enough detail for operational debugging

## 18. Audit Requirements

Every important action must create an audit event.

Audit events include:

- user created
- verification started
- verification completed
- Vouch created
- payment initialized
- Vouch accepted
- confirmation submitted
- Vouch completed
- Vouch expired
- refund initiated
- refund completed
- payment failed
- webhook processed
- admin viewed/acted where applicable

Audit events must include:

- actor user ID if available
- entity type
- entity ID
- action name
- timestamp
- safe metadata
- request ID where available

Audit events must not include:

- raw card data
- raw identity documents
- sensitive personal documents
- secrets
- open-ended transaction purpose text

## 19. Notification Requirements

Notification sending must be event-driven.

Initial channels:

- email

Future channels:

- SMS
- push
- webhook/API notifications

Notifications should be generated from domain events, not random UI components.

Notification content must use neutral, safe, professional language.

## 20. Testing Requirements

### Unit Tests

Use Vitest for:

- schemas
- state transition helpers
- fee calculations
- authz helpers
- DTO mappers
- utility functions

### Integration Tests

Use Vitest or integration harnesses for:

- server actions
- fetchers
- payment service adapters with mocks
- webhook event handling
- audit event creation

### E2E Tests

Use Playwright for:

- sign-up/sign-in smoke
- create Vouch flow
- accept Vouch flow
- dual confirmation flow
- expiration/refund flow
- unauthorized access prevention
- admin view access
- payment setup redirect behavior where mockable

## 21. Security Requirements

The system must:

- enforce auth server-side
- use CSRF-safe server action patterns
- verify webhook signatures
- validate all input
- avoid direct object reference vulnerabilities
- prevent users from accessing non-participant Vouches
- rate-limit sensitive actions
- avoid leaking payment metadata
- avoid storing unnecessary location or identity data
- protect admin routes
- log security-relevant events

## 22. Privacy Requirements

The product should minimize collected data.

Required:

- identity/verification status
- payment references
- Vouch participation
- confirmation timestamps
- operational audit records

Avoid:

- detailed meeting purpose
- private messaging
- full location history
- unnecessary profile data
- public personal pages
- behavioral reputation scores

## 23. Performance Requirements

MVP performance expectations:

- dashboard loads quickly for normal user Vouch counts
- Vouch detail has near-current status
- confirmation action responds with clear pending/success/failure state
- webhook reconciliation is idempotent and reliable
- admin views paginate results

Avoid premature optimization.

Prioritize correctness over speculative caching.

## 24. Accessibility Requirements

The interface must support:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible form labels
- clear error messages
- sufficient contrast
- status announcements where appropriate
- non-color-only status indicators

## 25. Deployment Requirements

The app should be deployable on Vercel.

Required environment variables likely include:

- database URL
- Clerk keys
- Stripe secret key
- Stripe webhook secret
- Stripe publishable key
- app base URL
- email provider keys if used
- admin seed/bootstrap config

Production deployments must run:

- lint
- typecheck
- tests where practical
- Prisma generate
- migrations
- contract validation once contracts exist

## 26. Operational Requirements

Admin/ops must be able to inspect:

- failed payments
- stuck Vouches
- webhook failures
- verification issues
- refund status
- user eligibility state
- audit timeline

Ops tooling must not become dispute judgment.

It should help diagnose system state, not decide human truth.

## 27. Implementation Priorities

### Phase 1

- authentication
- user model
- Vouch model
- create Vouch
- accept Vouch
- manual dual confirmation
- basic payment records
- audit events
- dashboard
- Vouch detail

### Phase 2

- Stripe Connect onboarding
- real payment flow
- webhook reconciliation
- refund/release automation
- notification events
- admin operational views

### Phase 3

- verification provider integration
- production legal copy
- stronger rate limiting
- advanced E2E coverage
- production observability

### Phase 4

- GPS confirmation prototype
- recurring Vouch research
- API access research
