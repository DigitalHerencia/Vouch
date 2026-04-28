# Vouch MVP Onboarding Audit for ChatGPT

Date: 2026-04-26

Purpose: give a new ChatGPT/code agent enough verified context to continue Vouch MVP implementation without re-deriving the product, violating constraints, or wasting time on already-settled architecture.

## Executive Summary

Vouch is a narrow commitment-backed payment coordination product:

```txt
create -> accept -> both confirm -> release
otherwise -> refund / void / non-capture
```

The repo has strong governance docs/contracts and a broad scaffold for the full app. The MVP is not finished. Auth, authz, setup gate, Clerk webhook, and some verification/setup foundations are partially implemented according to `.agents/execution/progress.json`. Large portions of backend and route orchestration remain scaffolded.

Current implementation risk is not lack of plan. The risk is generating code out of order or implementing marketplace/arbitration/payment-custody behavior by accident. The next agent should work from contracts and matrices, replace scaffold stubs in dependency order, and validate after each slice.

## Non-Negotiable Product Constraints

- Vouch is not a marketplace.
- Vouch is not a booking marketplace.
- Vouch is not a scheduler.
- Vouch is not a messaging app.
- Vouch is not a review/rating system.
- Vouch is not a dispute-resolution system.
- Vouch is not an escrow provider.
- Vouch is not a broker.
- Admins may inspect operational state only.
- Admins may not decide who deserves funds.
- Funds release only when both participants confirm presence inside the confirmation window and provider release/capture succeeds or is provider-accepted.
- If both confirmations do not happen before expiration, the provider flow must refund, void, or leave funds uncaptured.

Forbidden surfaces:

```txt
/browse
/providers
/messages
/reviews
/categories
/disputes
```

Forbidden entities:

```txt
PublicProfile
Review
Rating
MessageThread
ServiceListing
MarketplaceCategory
Recommendation
DisputeCase
EvidenceUpload
ReputationScore
```

## Source Of Truth

Use this order when implementing:

1. `.agents/docs/*.md`
2. `.agents/contracts/*.yaml`
3. `.agents/instructions/*.instructions.md`
4. Existing repo code
5. Agent judgment

Critical files:

- `AGENTS.md`
- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/acceptance-gates.yaml`
- `.agents/reports/Vouch Route Implementation Matrix.md`
- `.agents/reports/Vouch Backernd Implementation Matrix.md`
- `.agents/reports/actions-fetchers.md`
- `.agents/reports/transactions-dto.md`
- `.agents/reports/types-schema.md`
- `prisma/schema.prisma`
- `package.json`

Note: `.agents/reports/Vouch Backernd Implementation Matrix.md` has a filename typo. Do not rename it without checking imports/references or user approval. Its contents are the current backend implementation matrix.

## Current Repo Shape

Stack from `package.json`:

- Next.js 16 App Router
- React 19
- TypeScript 6
- Prisma 7 with Neon adapter
- Clerk
- Stripe
- Tailwind CSS 4
- shadcn/Radix-style UI packages
- React Hook Form
- Zod 4
- Vitest
- Playwright
- pnpm

Top-level code inventory observed:

| Area         | File count |
| ------------ | ---------: |
| `app`        |        102 |
| `components` |        148 |
| `features`   |        139 |
| `lib`        |        128 |
| `schemas`    |         18 |
| `types`      |         21 |
| `tests`      |         18 |

## Database Status

`prisma/schema.prisma` already contains the required canonical persistence model:

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
- `ProviderWebhookEvent`
- `AnalyticsEvent`
- `OperationalRetry`

Important schema facts:

- `ProviderWebhookEvent` exists and supports generic idempotency for `clerk`, `stripe`, and `stripe_identity`.
- `PaymentWebhookEvent` exists as Stripe/payment-specific projection.
- `PaymentRecord` has `lastErrorCode`, not `lastErrorMessage`.
- `User` has no `lastSignedInAt`.
- `NotificationEvent` uses `eventName` and `errorCode`; do not generate code expecting `type` or `failureCode` columns.
- `ConfirmationMethod` includes `gps`, but GPS confirmation is deferred. Do not implement GPS behavior for MVP unless explicitly requested.

## Implementation Status

Execution log says completed or partially completed:

- Governance docs/contracts/instructions/execution JSON created.
- Prisma schema implemented from domain model.
- Clerk auth foundation and authz helpers implemented.
- Clerk webhook verification/idempotency partially implemented.
- Setup gates and verification readiness helpers partially implemented.
- Focused authz/setup tests have passed previously according to execution logs.
- Full validation remains blocked by scaffold gaps.

Verified current scaffold burden:

| Area                      | `SCAFFOLD_NOT_IMPLEMENTED` markers |
| ------------------------- | ---------------------------------: |
| `lib/fetcher`             |                                168 |
| `lib/actions`             |                                 94 |
| `lib/db/transactions`     |                                 91 |
| `lib/db/mappers`          |                                 49 |
| `lib/integrations/stripe` |                                 13 |
| `lib/security`            |                                 10 |
| `lib/vouch`               |                                 10 |
| `lib/integrations/email`  |                                  9 |
| `lib/cache`               |                                  4 |
| `lib/jobs`                |                                  4 |
| `lib/observability`       |                                  4 |
| `lib/errors`              |                                  3 |
| `lib/invitations`         |                                  3 |
| `lib/notifications`       |                                  3 |
| `lib/integrations/clerk`  |                                  2 |
| Total                     |                                467 |

Interpretation: the repo is scaffold-heavy. Do not assume a named function is implemented just because the file exists.

## Dirty Worktree Notes

Current `git status --short` showed:

```txt
 M app/page.tsx
?? ".agents/reports/Vouch Backernd Implementation Matrix.md"
?? ".agents/reports/Vouch Route Implementation Matrix.md"
```

Do not revert `app/page.tsx`; it is a pre-existing user/worktree change.

This report adds:

```txt
.agents/reports/chatgpt-mvp-onboarding-audit.md
```

## Architecture Rules To Preserve

Route shell:

- `app/**/page.tsx` stays thin.
- Route shell imports feature page component.
- No Prisma, Stripe, authz, payment logic, or business state machines in route pages.

Features:

- `features/**` owns page orchestration, Suspense/loading/error composition, search-param parsing, action wiring, and mapping server errors into forms.
- Features may call fetchers/actions/schemas/components.
- Features must not bypass authz.

Components:

- `components/**` stays pure UI.
- Components receive DTOs/view models/callbacks.
- Components do not call Prisma, Stripe, Clerk server APIs, or enforce authorization.

Backend:

- `lib/fetcher/**` owns protected server reads.
- `lib/actions/**` owns server mutations.
- `lib/db/selects/**` owns minimal Prisma select shapes.
- `lib/db/mappers/**` maps DB records to transport-safe DTOs.
- `lib/db/transactions/**` owns DB mutation primitives only.

## Import Convention Warning

The route matrix has example imports like `@/schema/...`, but the repo folder is `schemas/`. Use:

```ts
import { someSchema } from "@/schemas/..."
```

unless the project later adds a `@/schema` alias.

## Route Matrix Summary

The route matrix defines these core surfaces:

- `/`
- `/how-it-works`
- `/pricing`
- `/faq`
- `/legal/terms`
- `/legal/privacy`
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/setup`
- `/settings`
- `/settings/payment`
- `/settings/payout`
- `/settings/verification`
- `/vouches`
- `/vouches/new`
- `/vouches/invite/[token]`
- `/vouches/[vouchId]`
- `/vouches/[vouchId]/confirm`
- `/admin`
- `/admin/vouches`
- `/admin/vouches/[vouchId]`
- `/admin/users`
- `/admin/payments`
- `/admin/audit`
- `/api/webhooks/stripe`
- `/api/webhooks/clerk`

Operational extension routes are planned but not in base `routes.yaml`:

- `/admin/users/[userId]`
- `/admin/payments/[paymentId]`
- `/admin/webhooks`
- `/admin/webhooks/[eventId]`
- `/admin/audit/[eventId]`

Do not implement extension routes until `routes.yaml` is amended or the user explicitly approves them.

## Backend Matrix Summary

Use `.agents/reports/Vouch Backernd Implementation Matrix.md` as the file-level guide for:

- `types/**`
- `schemas/**`
- `lib/db/selects/**`
- `lib/db/mappers/**`
- `lib/db/transactions/**`
- `lib/fetcher/**`
- `lib/actions/**`
- auth/authz/cache/error helpers
- integrations/provider helpers
- domain services/jobs/utilities

Key backend rule: replace scaffolds in dependency order, not route order.

Recommended implementation order:

1. Normalize `types/**` and `schemas/**`.
2. Implement `lib/db/selects/**`.
3. Implement `lib/db/mappers/**`.
4. Finish `lib/auth/**`, `lib/authz/**`, `lib/errors/**`, `lib/cache/**`.
5. Implement domain primitives in `lib/vouch/**`, `lib/invitations/**`, `lib/security/**`.
6. Implement `lib/db/transactions/**`.
7. Implement provider integrations.
8. Implement fetchers.
9. Implement actions.
10. Implement route feature wiring and components.
11. Implement jobs/webhooks.
12. Add tests and run validation gates.

## MVP Critical Path

### Phase 0: Make The Repo Compile

Goal: remove blockers that prevent useful validation.

Tasks:

- Replace or intentionally defer scaffold stubs that are imported by active routes/features/tests.
- Fix duplicate type/schema surfaces only when they break imports.
- Ensure `pnpm typecheck` can run far enough to reveal real domain issues.
- Keep changes local and contract-aligned.

Do not:

- Delete duplicate `.types.ts` or `.schemas.ts` files without import audit.
- Rename `lib/fetcher` to `lib/fetchers` during MVP unless necessary.
- Add new dependencies unless essential.

### Phase 1: Canonical Types And Schemas

Goal: make action/fetcher contracts stable.

Files:

- `types/action-result.ts`
- `types/common.ts`
- `types/vouch.ts`
- `types/auth.ts`
- `types/setup.ts`
- `types/verification.ts`
- `types/payment.ts`
- `types/user.ts`
- `types/dashboard.ts`
- `types/settings.ts`
- `types/admin.ts`
- `types/audit.ts`
- `types/notification.ts`
- `types/analytics.ts`
- `types/system.ts`
- `types/marketing.ts`
- matching `schemas/*.ts`

Watchouts:

- Prefer `z.infer<typeof schema>` for mutation/query inputs.
- Do not duplicate Zod-derived interfaces.
- Keep `ActionResult<T>` canonical in `types/action-result.ts`.
- Align Vouch enum values exactly with Prisma/contracts.
- Current `schemas/vouch.ts` is partial and uses simplified variants. Expand it to route/backend matrix variants.

### Phase 2: Domain Primitives

Goal: make core business rules testable before actions.

Files:

- `lib/vouch/fees.ts`
- `lib/vouch/state.ts`
- `lib/vouch/time-windows.ts`
- `lib/vouch/resolution.ts`
- `lib/vouch/status.ts`
- `lib/invitations/tokens.ts`
- `lib/security/hash.ts`
- `lib/security/idempotency.ts`
- `lib/security/request.ts`

Tests to add:

- fee calculation
- valid/invalid state transitions
- confirmation window predicates
- aggregate confirmation resolution
- invite token generation/hash/verify
- idempotency key generation/normalization

### Phase 3: Selects And Mappers

Goal: stop passing raw Prisma records beyond backend boundaries.

Files:

- `lib/db/selects/*.ts`
- `lib/db/mappers/*.ts`

Rules:

- Select only fields rendered or needed by policy.
- Convert dates to ISO strings in DTOs.
- Redact provider refs for participants.
- Do not expose raw provider metadata.
- Participant-safe audit timeline only includes `participantSafe` events.

### Phase 4: Transactions

Goal: implement deterministic DB mutation primitives.

Files:

- `lib/db/transactions/vouchTransactions.ts`
- `lib/db/transactions/invitationTransactions.ts`
- `lib/db/transactions/confirmationTransactions.ts`
- `lib/db/transactions/paymentTransactions.ts`
- `lib/db/transactions/auditTransactions.ts`
- `lib/db/transactions/notificationTransactions.ts`
- `lib/db/transactions/adminTransactions.ts`
- `lib/db/transactions/analyticsTransactions.ts`
- `lib/db/transactions/systemTransactions.ts`

Rules:

- Transactions receive `Prisma.TransactionClient`.
- Transactions do not read Clerk session state.
- Transactions do not verify webhooks.
- Transactions do not call Stripe.
- Transactions do not revalidate paths/tags.
- Transactions may enforce DB-level invariants defensively.

### Phase 5: Vouch MVP Backend

Goal: implement the core product loop without full production payments if Stripe architecture is still unresolved.

Required backend flows:

- Create Vouch
- Create invitation
- Send/copy invitation
- Mark invite opened
- Accept Vouch
- Decline Vouch
- Cancel pending Vouch
- Confirm presence
- Wait for other party when one-sided
- Complete only after both confirmed
- Expire unresolved Vouches
- Refund/void/non-capture unresolved payment
- Write audit events
- Queue notifications
- Revalidate related cache tags

Files:

- `lib/actions/vouchActions.ts`
- `lib/fetcher/vouchFetchers.ts`
- `lib/actions/paymentActions.ts`
- `lib/fetcher/paymentFetchers.ts`
- `lib/cache/revalidate.ts`
- `lib/errors/action-errors.ts`

### Phase 6: Payment Provider Decision

Blocker: exact Stripe Connect payment architecture is not finalized for production.

Before production payment implementation, decide:

- PaymentIntent authorization/capture strategy.
- Connected account transfer timing.
- Application fee behavior.
- Refund vs void vs non-capture behavior by provider state.
- How to avoid legal/custody/escrow claims.

MVP sandbox can implement provider-backed references and a narrow adapter, but do not claim production readiness until this is reviewed.

Files:

- `lib/integrations/stripe/client.ts`
- `lib/integrations/stripe/connect.ts`
- `lib/integrations/stripe/identity.ts`
- `lib/integrations/stripe/payment-intents.ts`
- `lib/integrations/stripe/webhooks.ts`
- `lib/payments/adapters/stripe-payment-adapter.ts`
- `lib/payments/webhooks/process-stripe-webhook.ts`
- `lib/verification/webhooks/process-stripe-identity-webhook.ts`

### Phase 7: Route Feature Wiring

Goal: make app pages usable through thin route shells.

Follow `.agents/reports/Vouch Route Implementation Matrix.md`.

Priority routes:

1. `/sign-in`
2. `/sign-up`
3. `/setup`
4. `/settings/payment`
5. `/settings/payout`
6. `/settings/verification`
7. `/vouches/new`
8. `/vouches/invite/[token]`
9. `/vouches/[vouchId]`
10. `/vouches/[vouchId]/confirm`
11. `/dashboard`
12. `/vouches`
13. `/admin`
14. `/admin/vouches`
15. `/admin/payments`
16. `/admin/audit`
17. public marketing/legal pages

## Test Strategy

Run the smallest relevant check after each slice.

Minimum useful commands:

```bash
pnpm prisma:validate
pnpm typecheck
pnpm test
pnpm lint
pnpm validate:contracts
```

Full pre-ship command:

```bash
pnpm validate
pnpm test:e2e
```

Focused unit tests to add first:

- `tests/unit/authz/policies.test.ts` already exists.
- setup gate tests already exist according to execution logs.
- add Vouch state transition tests.
- add confirmation window tests.
- add fee calculation tests.
- add invite token tests.
- add DTO mapper tests.
- add webhook idempotency tests.
- add action integration tests for create/accept/confirm/expire with mocked provider adapter.

E2E tests before MVP ship:

- sign-in/auth smoke
- setup gate blocks create until ready
- create Vouch
- invite open
- accept Vouch
- both parties confirm
- one-sided confirmation waits
- expired incomplete confirmation refunds/voids/non-captures
- unrelated user blocked
- non-admin blocked from admin

## Known Gaps And Decisions

| Gap                                                | Severity | Recommendation                                                                                    |
| -------------------------------------------------- | -------: | ------------------------------------------------------------------------------------------------- |
| 467 scaffold markers remain                        | Critical | Replace in dependency order. Do not wire routes to scaffolded functions.                          |
| Stripe Connect flow unresolved                     | Critical | Decide/document before production payment release.                                                |
| Legal/compliance review unresolved                 | Critical | Avoid “escrow” and production legal claims.                                                       |
| Admin extension routes not in `routes.yaml`        |     High | Do not implement routes until contract update or explicit approval.                               |
| Duplicate type/schema surfaces exist               |   Medium | Migrate imports gradually; delete only after audit.                                               |
| `lib/stripe` and `lib/integrations/stripe` overlap |   Medium | Keep if responsibilities are distinct; consolidate only after implementation reveals duplication. |
| Route matrix import examples use `@/schema`        |      Low | Use actual `@/schemas` path.                                                                      |
| Report filename typo `Backernd`                    |      Low | Leave unless user approves rename.                                                                |

## Stop Conditions For Next Agent

Stop and ask/report if:

- Requested work adds marketplace behavior.
- Requested work adds arbitration/dispute behavior.
- Requested work requires direct custody of funds.
- Stripe behavior is ambiguous and affects release/refund/custody semantics.
- Legal/compliance language is needed for escrow-adjacent claims.
- Contracts conflict with docs.
- Existing code conflicts with contracts in a way that requires product decision.
- Migration could destroy data.
- Required env vars/secrets are missing.
- Tests fail for unrelated reasons and cannot be safely fixed in scope.

## ChatGPT Takeover Prompt

Use this prompt to onboard a new ChatGPT coding session:

```txt
You are taking over implementation of the Vouch MVP in D:\Vouch.

Read these files first:
1. AGENTS.md
2. .agents/contracts/domain-model.yaml
3. .agents/contracts/authz.yaml
4. .agents/contracts/routes.yaml
5. .agents/contracts/acceptance-gates.yaml
6. .agents/reports/chatgpt-mvp-onboarding-audit.md
7. .agents/reports/Vouch Route Implementation Matrix.md
8. .agents/reports/Vouch Backernd Implementation Matrix.md
9. prisma/schema.prisma
10. package.json

Do not implement marketplace, messaging, reviews, ratings, dispute, evidence, arbitration, broker, scheduler, or escrow behavior.

The core product loop is:
create -> accept -> both confirm -> release
otherwise -> refund / void / non-capture.

Work in dependency order:
types/schemas -> domain primitives -> selects/mappers -> transactions -> fetchers/actions -> route feature wiring -> tests.

Before editing, inspect current files because many exist but are scaffold stubs. Replace stubs surgically. Keep app route pages thin. Keep protected reads in lib/fetcher and mutations in lib/actions. Use Prisma selects and mappers. Return ActionResult from actions. Write audit events for mutations. Revalidate centrally.

Do not rename/delete duplicate files unless import audit proves it is safe. Do not touch unrelated dirty files.

Start by running a scaffold audit and then pick the smallest P0 slice that moves toward create/accept/confirm MVP.
```

## Recommended First Task For Takeover

Start with this concrete slice:

```txt
Implement Vouch domain primitives and tests:
- lib/vouch/state.ts
- lib/vouch/time-windows.ts
- lib/vouch/resolution.ts
- lib/invitations/tokens.ts
- tests/unit/vouch/state.test.ts
- tests/unit/vouch/time-windows.test.ts
- tests/unit/vouch/resolution.test.ts
- tests/unit/invitations/tokens.test.ts

Do not call Stripe.
Do not touch routes.
Do not change Prisma schema.
Run focused Vitest tests plus pnpm prisma:validate.
```

Reason: it establishes the invariant core before actions/fetchers depend on it.
