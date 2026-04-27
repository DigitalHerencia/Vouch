# Vouch Backend Implementation Matrix

Date: 2026-04-26

## Source Basis

This matrix is derived from:

- `.agents/reports/actions-fetchers.md`
- `.agents/reports/transactions-dto.md`
- `.agents/reports/types-schema.md`
- `C:\Users\scree\Documents\DevNotes\Projects\Vouch\Vouch Route Implementation Matrix.md`
- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/contracts/routes.yaml`
- `package.json`
- `prisma/schema.prisma`
- Existing `lib/`, `types/`, and `schemas/` files

The listed backend files already exist in this repo. Most `lib/actions`, `lib/fetcher`, and `lib/db/transactions` files are scaffold stubs that throw `SCAFFOLD_NOT_IMPLEMENTED`. The implementation work is to replace stubs with server-first, contract-aligned logic.

The route matrix confirms that every `app/**/page.tsx` should remain a thin shell, route orchestration belongs in `features/**`, backend reads/writes flow through `lib/fetcher/**` and `lib/actions/**`, and pure components must not fetch protected data or hide business rules.

## Global Backend Rules

- Fetchers must authenticate, authorize, query with minimal Prisma selects, map to DTO/read models, apply explicit no-store/dynamic caching where sensitive, and never return raw Prisma records.
- Server actions must authenticate, authorize, validate with Zod, execute transaction/provider work, write audit events, revalidate relevant cache tags/paths, and return `ActionResult<T>`.
- Transactions are database mutation primitives only. They must not read Clerk session state, parse request bodies, verify webhooks, call Stripe, or revalidate paths.
- Provider integrations must store provider references, statuses, timestamps, safe metadata, and error codes only. Do not store full Clerk/Stripe payloads.
- Admin implementation is operational only. Do not add dispute, evidence, award, forced release, or confirmation rewrite behavior.
- Vouch release is allowed only after both payer and payee presence confirmations exist within the confirmation window and provider release/capture succeeds or is accepted.
- If both confirmations are incomplete at expiration, perform refund, void, or non-capture according to provider state.

## Add / Rename / Delete Guidance

| Path | Recommendation | Basis |
|---|---|---|
| `.agents/reports/backend-implementation-matrix.md` | Add this planning artifact. | User requested backend implementation matrix. |
| `types/action-result.ts` | Keep as canonical `ActionResult`; import it from actions. | Existing file matches project action result contract. |
| `types/auth.types.ts`, `types/payment.types.ts`, `types/setup.types.ts`, `types/vouch-status.types.ts` | Do not expand. Prefer migrating imports to canonical `types/auth.ts`, `types/payment.ts`, `types/setup.ts`, `types/vouch-status.ts` or `types/vouch.ts`; then delete only after no imports remain. | Existing repo has duplicate type surfaces. `types-schema.md` calls for one domain file per type domain. |
| `schemas/auth.schemas.ts`, `schemas/setup.schemas.ts` | Do not expand. Prefer migrating imports to `schemas/auth.ts` and `schemas/setup.ts`; then delete only after no imports remain. | Existing repo has duplicate schema surfaces. `types-schema.md` calls for one domain file per schema domain. |
| `schemas/index.ts` | Keep as a barrel only if it re-exports canonical schema files. | Existing file exists; useful for stable imports. |
| `lib/fetcher/` | Keep current folder name for now. Do not rename to `lib/fetchers/` unless all imports are migrated. | User-provided target tree and existing repo use `lib/fetcher`; project-doc architecture uses `lib/<domain>/fetchers/`, but current scaffold intentionally uses flat files. |
| `lib/stripe/*` and `lib/integrations/stripe/*` | Keep both only if responsibilities are separated: `lib/stripe` for app config/status constants, `lib/integrations/stripe` for Stripe SDK operations. Otherwise consolidate later. | Existing repo contains both. Avoid speculative deletion. |
| `lib/auth/redirect.ts` and `lib/auth/redirects.ts` | Keep only if one is primitive helpers and one is route policy. If overlapping, consolidate after import audit. | Existing duplicate naming requires import inspection before deletion. |
| Prisma schema | No required model add for Clerk idempotency: `ProviderWebhookEvent` already exists and supports `clerk`, `stripe`, and `stripe_identity`. | `schema.prisma` includes `ProviderWebhookEvent` with unique `[provider, providerEventId]`. |
| Admin extension routes `/admin/users/[userId]`, `/admin/payments/[paymentId]`, `/admin/webhooks`, `/admin/webhooks/[eventId]`, `/admin/audit/[eventId]` | Keep backend fetchers/types/schemas planned, but do not implement routes until `routes.yaml` is amended or project explicitly accepts them as operational extensions. | Route matrix marks these as operational extensions; base route contract does not list them. |
| Schema import spelling | Use actual repo folder `schemas/` and alias imports such as `@/schemas/...`. Do not generate imports from `@/schema/...` unless the project creates that alias. | Route matrix examples say `@/schema/...`, but existing repo uses `schemas/`. |

## Implementation Order

1. `types/` + `schemas/` canonical domain contracts.
2. `lib/db/selects/` + `lib/db/mappers/`.
3. `lib/auth/`, `lib/authz/`, `lib/errors/`, `lib/cache/`.
4. `lib/db/transactions/`.
5. Provider/integration helpers.
6. `lib/fetcher/`.
7. `lib/actions/`.
8. Jobs and webhook processors.

## Route-To-Backend Coverage Matrix

| Route / surface | Backend files that must support it |
|---|---|
| `/`, `/how-it-works`, `/pricing`, `/faq`, `/legal/terms`, `/legal/privacy` | `lib/fetcher/marketingFetchers.ts`, `lib/actions/marketingActions.ts`, `types/marketing.ts`, `schemas/marketing.ts`, `schemas/common.ts`. Static/revalidated public content only. |
| `/sign-in`, `/sign-up` | `lib/fetcher/authFetchers.ts`, `lib/actions/authActions.ts`, `lib/auth/current-user.ts`, `lib/auth/redirects.ts`, `lib/auth/routes.ts`, `types/auth.ts`, `schemas/auth.ts`. Preserve invite/create return context with validated internal paths. |
| `/dashboard` | `lib/fetcher/dashboardFetchers.ts`, `lib/fetcher/setupFetchers.ts`, `lib/fetcher/vouchFetchers.ts`, `lib/db/selects/dashboard.selects.ts`, `lib/db/mappers/dashboard.mappers.ts`, `types/dashboard.ts`, `schemas/dashboard.ts`. No dashboard mutation for MVP. |
| `/setup` | `lib/fetcher/setupFetchers.ts`, `lib/actions/setupActions.ts`, `lib/auth/setup-gates.ts`, `lib/setup/status.ts`, `lib/db/transactions/setupTransactions.ts`, `types/setup.ts`, `schemas/setup.ts`. Setup is computed from canonical readiness records. |
| `/settings` | `lib/fetcher/settingsFetchers.ts`, `lib/actions/settingsActions.ts`, `lib/fetcher/userFetchers.ts`, `lib/fetcher/verificationFetchers.ts`, `lib/fetcher/paymentFetchers.ts`, `types/settings.ts`, `schemas/settings.ts`, `types/user.ts`, `schemas/user.ts`. Private account/readiness only. |
| `/settings/payment` | `lib/fetcher/paymentFetchers.ts`, `lib/actions/paymentActions.ts`, `lib/integrations/stripe/payment-intents.ts`, `lib/db/transactions/paymentTransactions.ts`, `types/payment.ts`, `schemas/payment.ts`. No raw card data. |
| `/settings/payout` | `lib/fetcher/paymentFetchers.ts`, `lib/actions/paymentActions.ts`, `lib/integrations/stripe/connect.ts`, `lib/db/transactions/paymentTransactions.ts`, `types/payment.ts`, `schemas/payment.ts`. Store Connect references/readiness only. |
| `/settings/verification` | `lib/fetcher/verificationFetchers.ts`, `lib/actions/verificationActions.ts`, `lib/integrations/stripe/identity.ts`, `lib/verification/webhooks/process-stripe-identity-webhook.ts`, `types/verification.ts`, `schemas/verification.ts`. No raw identity documents. |
| `/vouches` | `lib/fetcher/vouchFetchers.ts`, `lib/fetcher/paymentFetchers.ts`, `lib/fetcher/auditFetchers.ts`, `lib/db/selects/vouch.selects.ts`, `lib/db/mappers/vouch.mappers.ts`, `types/vouch.ts`, `schemas/vouch.ts`. Participant-scoped only. |
| `/vouches/new` | `lib/fetcher/vouchFetchers.ts`, `lib/actions/vouchActions.ts`, `lib/actions/paymentActions.ts`, `lib/actions/notificationActions.ts`, `lib/vouch/fees.ts`, `lib/invitations/tokens.ts`, `lib/db/transactions/vouchTransactions.ts`, `lib/db/transactions/invitationTransactions.ts`, `types/vouch.ts`, `schemas/vouch.ts`. Do not request marketplace fields. |
| `/vouches/invite/[token]` | `lib/fetcher/vouchFetchers.ts`, `lib/actions/vouchActions.ts`, `lib/actions/setupActions.ts`, `lib/actions/paymentActions.ts`, `lib/invitations/tokens.ts`, `lib/db/transactions/invitationTransactions.ts`, `types/vouch.ts`, `schemas/vouch.ts`. Hash token before lookup; acceptance requires auth/setup. |
| `/vouches/[vouchId]` | `lib/fetcher/vouchFetchers.ts`, `lib/actions/vouchActions.ts`, `lib/fetcher/paymentFetchers.ts`, `lib/fetcher/auditFetchers.ts`, `lib/vouch/status.ts`, `lib/vouch/time-windows.ts`, `types/vouch.ts`, `schemas/vouch.ts`. Must answer status, amount, next action, deadline, other-party action, and finality. |
| `/vouches/[vouchId]/confirm` | `lib/fetcher/vouchFetchers.ts`, `lib/actions/vouchActions.ts`, `lib/db/transactions/confirmationTransactions.ts`, `lib/vouch/resolution.ts`, `lib/vouch/time-windows.ts`, `types/vouch.ts`, `schemas/vouch.ts`. One-sided confirmation returns waiting state and never releases funds. |
| `/admin`, `/admin/vouches`, `/admin/vouches/[vouchId]`, `/admin/users`, `/admin/payments`, `/admin/audit` | `lib/fetcher/adminFetchers.ts`, `lib/actions/adminActions.ts`, `lib/authz/admin.ts`, `lib/db/selects/admin.selects.ts`, `lib/db/mappers/admin.mappers.ts`, `types/admin.ts`, `schemas/admin.ts`. Operational read/safe retry only. |
| Admin operational extensions | Keep backend support in `adminFetchers`, `adminActions`, `types/admin.ts`, and `schemas/admin.ts`, but gate route creation on route-contract update. |
| `/api/webhooks/stripe` | `lib/actions/paymentActions.ts`, `lib/integrations/stripe/webhooks.ts`, `lib/payments/webhooks/process-stripe-webhook.ts`, `lib/webhooks/provider-webhook-ledger.ts`, `lib/db/transactions/paymentTransactions.ts`, `schemas/payment.ts`. Verify raw body signature and process idempotently. |
| `/api/webhooks/clerk` | `lib/actions/authActions.ts`, `lib/integrations/clerk/webhooks.ts`, `lib/clerk/process-clerk-webhook.ts`, `lib/webhooks/provider-webhook-ledger.ts`, `lib/db/transactions/authTransactions.ts`, `schemas/auth.ts`. Subscribe to `user.created`, `user.updated`, `user.deleted` for MVP. |

## Types Matrix

| File | Generate / complete |
|---|---|
| `types/common.ts` | Shared primitives: IDs, ISO strings, money/currency, pagination, date range, page mode, server error state. Re-export or align with `types/action-result.ts` without duplicating `ActionResult`. |
| `types/action-result.ts` | Keep canonical `ActionResult<T>`, `actionSuccess`, `actionFailure`; ensure all actions use this shape. |
| `types/vouch.ts` | Zod-inferred input types for create draft/create/fee preview/invite/accept/decline/cancel/confirm/list. Include domain unions for Vouch, invitation, participant role, confirmation, aggregate confirmation, recipient method, detail variants, confirm variants. Align `recipientMethod` to reports: `email` and `share_link` unless UI intentionally uses `link`. |
| `types/vouch-status.ts` | If kept, make it a narrow re-export/status helper surface derived from `types/vouch.ts`; avoid a competing status union. |
| `types/auth.ts` | Base roles, contextual roles, auth entry context, auth page variants, redirect context, session user, authz snapshot, Clerk sync input. |
| `types/user.ts` | Private account types only: user status, safe identity, private account info, profile basics input, status change input. No public profile fields. |
| `types/setup.ts` | Setup requirements/statuses/action contexts, checklist item state, setup gate result, terms acceptance input. |
| `types/verification.ts` | Verification status/kind, start input, provider return input, status update input, page variants. |
| `types/payment.ts` | Payment/payout readiness, payment/refund statuses, refund reasons, provider return input, operation input, failure stage/input. No raw Stripe payload types. |
| `types/dashboard.ts` | Dashboard section IDs, variants, search params, section state. |
| `types/settings.ts` | Settings variants, section IDs, search params, profile update input. |
| `types/admin.ts` | Admin route sections, page variants, safe retry operations, filters, safe retry input, disable user input. |
| `types/audit.ts` | Audit actor/entity/event names and write/filter inputs. Include `ProviderWebhookEvent` as an audit entity because Prisma now has it. |
| `types/notification.ts` | Notification channel/status/type, queue/send/update delivery inputs. |
| `types/analytics.ts` | Privacy-safe analytics event groups/names and track event input. |
| `types/system.ts` | System page variants, toast state, unauthorized/not-found/action-failure inputs. |
| `types/marketing.ts` | Public page IDs, CTA IDs, legal page IDs, navigation item, page/CTA event inputs. No search/discovery types. |

## Schemas Matrix

| File | Generate / complete |
|---|---|
| `schemas/common.ts` | ID, public ID, user ID, vouch ID, invite token, ISO datetime, currency, money, percentage basis points, pagination, date range, email, labels, internal return path, safe search param schemas. Add sanitizers for trim, email normalize, internal path, positive int, money cents. |
| `schemas/vouch.ts` | Complete canonical schemas for create draft/create/fee preview/send/resend/invite token/accept/decline/cancel/confirm/list/params/variants. Required refinements: minimum amount, `usd`, `confirmationOpensAt < confirmationExpiresAt`, meeting start policy, recipient email required for email invites, label max 120, terms accepted. Current file is partial and uses simplified variants; expand to report variants. |
| `schemas/auth.ts` | Base/contextual role, auth entry/page variants, redirect/search params, Clerk sync, Clerk webhook headers and event envelope. Sanitize return paths and invite tokens. |
| `schemas/user.ts` | User status, profile basics, user status change, safe identity, private account info. |
| `schemas/setup.ts` | Setup requirement/status/context, setup gate input, return context, accept terms, checklist search params. |
| `schemas/verification.ts` | Verification status/kind, start input, provider return input, status update input, page variant. |
| `schemas/payment.ts` | Payment provider/readiness/status/refund/failure schemas, setup/onboarding return schemas, operation schemas, Stripe webhook headers/envelope/process input. |
| `schemas/dashboard.ts` | Dashboard section/variant/search params/sort. |
| `schemas/settings.ts` | Settings variant/section/search params/update profile basics. |
| `schemas/admin.ts` | Admin sections/variants/safe retry operation, vouch/user/payment/webhook/audit filters, safe retry input, disable user input. |
| `schemas/audit.ts` | Audit actor/entity/event names, write event input, filter input, participant-safe filter, safe metadata/request ID sanitizer. |
| `schemas/notification.ts` | Notification channel/status/type, queue/send/update delivery/filter schemas. |
| `schemas/analytics.ts` | Analytics event group/name, track input, per-group privacy-safe properties. |
| `schemas/system.ts` | System variants, toast, unauthorized, not found, server action failure, healthcheck, revalidate tag input. |
| `schemas/marketing.ts` | Marketing page/CTA/legal IDs, page viewed, CTA clicked, public navigation item, sanitized path/referrer. |
| `schemas/index.ts` | Re-export only canonical schema files; avoid exporting duplicate `.schemas.ts` files once migrated. |

## Selects Matrix

| File | Generate / complete |
|---|---|
| `lib/db/selects/user.selects.ts` | User auth lookup, session, safe identity, private account, account status, readiness, admin list/detail selects. |
| `lib/db/selects/auth.selects.ts` | Current user auth, active user gate, admin capability, contextual participant role, invite candidate auth, webhook user sync selects. |
| `lib/db/selects/setup.selects.ts` | Setup checklist/progress/gates/account readiness/terms status selects using canonical facts only. |
| `lib/db/selects/verification.selects.ts` | Verification status/card/admin summary selects with provider reference redacted/masked only if needed. |
| `lib/db/selects/payment.selects.ts` | Payment customer readiness, connected account readiness, settings/payout, participant-safe payment/refund summaries, admin payment/webhook detail selects. |
| `lib/db/selects/vouch.selects.ts` | Vouch card/list/detail/confirmation/window/payment/timeline/admin failure selects with nested safe identity, invitation, confirmations, payment/refund, participant-safe audit. |
| `lib/db/selects/invitation.selects.ts` | Token lookup by hash, invitation summary/status, invited Vouch summary, admin invitation select. Never plaintext tokens. |
| `lib/db/selects/confirmation.selects.ts` | Participant summary, status, aggregate confirmation, confirm eligibility, admin confirmation select. |
| `lib/db/selects/audit.selects.ts` | Participant-safe timeline, admin list/detail, Vouch/payment/user summaries. Exclude unsafe metadata from participant views. |
| `lib/db/selects/notification.selects.ts` | Notification list/detail/delivery/vouch/admin selects. Use Prisma field names: `eventName`, `errorCode`, not `type`/`failureCode`. |
| `lib/db/selects/dashboard.selects.ts` | Dashboard summary and section selects reusing Vouch list/card selects. |
| `lib/db/selects/settings.selects.ts` | Account settings, profile basics, private info, account/verification/payment/payout/terms cards. |
| `lib/db/selects/admin.selects.ts` | Admin dashboard/failure summary and Vouch/user/payment/webhook/audit list/detail selects. Include `ProviderWebhookEvent` for generic webhook ledger views. |

## Mappers / DTO Matrix

| File | Generate / complete |
|---|---|
| `lib/db/mappers/user.mappers.ts` | Map selected user records to `UserSafeIdentity`, `PrivateAccountInfo`, account status/readiness/admin user DTOs. |
| `lib/db/mappers/auth.mappers.ts` | Map Clerk/current-user DB records to session user/authz snapshot. |
| `lib/db/mappers/setup.mappers.ts` | Compute checklist, setup gates, blockers, readiness summary from User + VerificationProfile + PaymentCustomer + ConnectedAccount + TermsAcceptance. |
| `lib/db/mappers/verification.mappers.ts` | Map verification profile to status/card/admin summary DTOs. |
| `lib/db/mappers/payment.mappers.ts` | Map payment/refund/customer/connected-account records to participant-safe and admin DTOs; redact provider references in admin DTOs. |
| `lib/db/mappers/vouch.mappers.ts` | Map Vouch records to list items, detail view models, confirmation state, window summary, payment summary, timeline, next action. Convert Date to ISO strings. |
| `lib/db/mappers/invitation.mappers.ts` | Map invitation/token lookup records to invite landing and summary DTOs without token hash exposure. |
| `lib/db/mappers/confirmation.mappers.ts` | Map confirmations to participant summaries and aggregate confirmation status. |
| `lib/db/mappers/audit.mappers.ts` | Map audit events to participant-safe timeline and admin detail DTOs with safe metadata filtering. |
| `lib/db/mappers/notification.mappers.ts` | Map notification events to delivery/list/detail DTOs. |
| `lib/db/mappers/dashboard.mappers.ts` | Compose dashboard summary/sections from Vouch DTOs and setup status. |
| `lib/db/mappers/settings.mappers.ts` | Compose settings page/cards from user/readiness/terms records. |
| `lib/db/mappers/admin.mappers.ts` | Compose operational admin DTOs only. No arbitration fields/actions. |

## Transactions Matrix

| File | Generate / complete |
|---|---|
| `lib/db/transactions/authTransactions.ts` | Upsert Clerk user, create default verification profile, sync email/phone/display name, soft-disable deleted Clerk users, ensure setup records, record Clerk webhook received/processed/ignored/failed in `ProviderWebhookEvent`. |
| `lib/db/transactions/userTransactions.ts` | Create/update private user account info, update status, disable/reactivate, optional last sign-in audit if persisted via audit only. Existing Prisma `User` has no `lastSignedInAt`; do not invent column without contract update. |
| `lib/db/transactions/setupTransactions.ts` | Accept/ensure terms. Do not persist duplicate setup snapshots unless schema is extended; compute setup from canonical facts. |
| `lib/db/transactions/verificationTransactions.ts` | Create profile, update identity/adult statuses, provider reference, pending/verified/rejected/requires_action/expired states. |
| `lib/db/transactions/paymentTransactions.ts` | Upsert payment customer/connected account, update readiness/capabilities, create/update payment/refund records, mark payment/refund statuses, record payment webhook projection and generic provider webhook ledger statuses. |
| `lib/db/transactions/vouchTransactions.ts` | Create Vouch, bind payee, update statuses/timestamps, cancel pending, mark active/completed/expired/refunded/canceled/failed, complete with payment release, expire with refund, mark resolution failure. Enforce payer immutability and no self-payee in caller/policy plus DB transaction checks. |
| `lib/db/transactions/invitationTransactions.ts` | Create invitation with token hash, mark sent/opened/accepted/declined/expired, invalidate, rotate token hash. |
| `lib/db/transactions/confirmationTransactions.ts` | Create presence confirmation, assert no duplicate, aggregate confirmation status. Do not create GPS behavior unless explicitly requested; `gps` exists as enum but MVP manual confirmation is primary. |
| `lib/db/transactions/auditTransactions.ts` | Write typed audit events for user/auth/verification/Vouch/payment/webhook/notification/admin. Strip unsafe metadata. |
| `lib/db/transactions/notificationTransactions.ts` | Queue notification, mark sent/failed/skipped, update delivery, retry notification. |
| `lib/db/transactions/adminTransactions.ts` | Disable user operationally, record admin views, record safe retry started/completed/failed in `OperationalRetry`. No truth mutation. |
| `lib/db/transactions/analyticsTransactions.ts` | Persist privacy-safe analytics events into `AnalyticsEvent` if local analytics is used. |
| `lib/db/transactions/systemTransactions.ts` | Record operational errors/action failures via audit/analytics/operational retry where schema supports it. Avoid adding persistent maintenance state without contract/schema update. |

## Fetchers Matrix

| File | Generate / complete |
|---|---|
| `lib/fetcher/marketingFetchers.ts` | Return static/revalidated landing/how/pricing/FAQ/legal/nav/footer DTOs. No marketplace content. |
| `lib/fetcher/authFetchers.ts` | Current user/session helpers, auth page state, setup status, authz snapshot, contextual participant role, invite-preserved auth context. |
| `lib/fetcher/userFetchers.ts` | User by ID/Clerk ID, current profile/account status, private account info, safe display identity, email summary. |
| `lib/fetcher/setupFetchers.ts` | Setup page/checklist/progress/blockers, create/accept/confirm gates, terms status, return context, readiness summary. |
| `lib/fetcher/verificationFetchers.ts` | Verification status, identity/adult states, provider return state, blocked state, status card. |
| `lib/fetcher/paymentFetchers.ts` | Payment/payout settings/readiness/setup/return/ready/failed/restricted states, participant-safe payment/refund summaries, status cards, provider unavailable state. |
| `lib/fetcher/vouchFetchers.ts` | Create, invite, accept, list, detail, confirmation, share, timeline, payment summary, audit timeline, and next-action states listed in `actions-fetchers.md`. Use dynamic/no-store. |
| `lib/fetcher/dashboardFetchers.ts` | Dashboard page state, summary, setup banner, action-required/active/pending/completed/expired-refunded sections, payer/payee summaries, empty/error state, search params. |
| `lib/fetcher/settingsFetchers.ts` | Account/profile/private info/status cards and settings loading/error states. |
| `lib/fetcher/adminFetchers.ts` | Admin dashboard/failure state, Vouch/user/payment/webhook/audit lists/details, safe retry preview, unauthorized state. Admin-gated. |
| `lib/fetcher/auditFetchers.ts` | Participant-safe and admin audit timelines, event lists/details, Vouch/payment/user summaries. |
| `lib/fetcher/notificationFetchers.ts` | User/admin notification events, delivery state, preferences if implemented, Vouch notification list, detail. |
| `lib/fetcher/analyticsFetchers.ts` | Admin/ops aggregate summaries for lifecycle, setup funnel, Vouch funnel, payment failures, notification delivery, admin operations. |
| `lib/fetcher/systemFetchers.ts` | Loading/error/unauthorized/not-found/action-failure/provider-unavailable/degraded state DTOs. |

## Actions Matrix

| File | Generate / complete |
|---|---|
| `lib/actions/marketingActions.ts` | Track privacy-safe page viewed and CTA clicked events only. |
| `lib/actions/authActions.ts` | Sync Clerk user, handle Clerk webhook, ensure local session user, resolve post-auth redirect. Webhook must verify Svix signature before transaction work. |
| `lib/actions/userActions.ts` | Upsert from auth provider, update private account info, admin-gated status wrappers only where policy allows. |
| `lib/actions/setupActions.ts` | Accept terms, refresh setup status, continue after setup, start required setup flows for create/accept/confirm. |
| `lib/actions/verificationActions.ts` | Start identity/adult verification, handle provider return, reconcile profile, mark requires_action/rejected/verified. |
| `lib/actions/paymentActions.ts` | Start payment method setup, handle return, refresh readiness, start payout onboarding, initialize/authorize/release/refund Vouch payment, handle/record/process Stripe webhook, reconcile statuses, mark failure. |
| `lib/actions/vouchActions.ts` | Create draft validation, fee calculation, create Vouch/invitation, send/resend/invalidate invite, mark opened, accept/decline/cancel, confirm presence, aggregate confirmation, complete if both confirmed, expire/refund unresolved Vouches, mark/retry failed resolution. |
| `lib/actions/dashboardActions.ts` | Keep empty for MVP unless persisting preferences. If implemented, only update dashboard preferences. |
| `lib/actions/settingsActions.ts` | Update profile basics, refresh readiness, start payment/payout/verification setup, accept terms from settings. |
| `lib/actions/adminActions.ts` | Disable user if allowed, retry notification/provider reconciliation/webhook/refund sync, record admin view/safe retry lifecycle. |
| `lib/actions/auditActions.ts` | Internal audit writers. Not user-triggered UI actions. |
| `lib/actions/notificationActions.ts` | Queue invite/accepted/window-open/confirmation-recorded/completed/expired-refunded/payment-failed notifications, send queued, retry, update delivery, mark failed/skipped. |
| `lib/actions/analyticsActions.ts` | Internal privacy-safe event writers by group. |
| `lib/actions/systemActions.ts` | Healthcheck, cache revalidation helpers, record action/operational failures. |

## Auth / Authz / Cache / Errors Matrix

| File | Generate / complete |
|---|---|
| `lib/auth/clerk.ts` | Clerk payload normalization to local user sync input; no raw payload persistence. |
| `lib/auth/current-user.ts` | Keep server-only current user/require helpers. Ensure DB sync path writes audit through transaction helpers and avoids unsafe metadata. |
| `lib/auth/redirect.ts` | Single redirect helper primitives if still needed. |
| `lib/auth/redirects.ts` | Route-level post-auth/setup redirect policy. Consolidate with `redirect.ts` later if duplicate. |
| `lib/auth/routes.ts` | Auth route constants and public/protected/admin classification from `routes.yaml`. |
| `lib/auth/setup-gates.ts` | Compute create/accept/confirm gate results from canonical readiness facts. |
| `lib/auth/webhooks.ts` | Clerk webhook signature/header parsing helpers. |
| `lib/authz/admin.ts` | Admin capability checks; deny disabled admins. |
| `lib/authz/assertions.ts` | Throwing assertions for require participant/admin/capability/setup gate. |
| `lib/authz/capabilities.ts` | Capability constants for create, accept, confirm, admin operational views. |
| `lib/authz/participants.ts` | Resolve payer/payee/invite candidate roles. |
| `lib/authz/policies.ts` | Keep pure boolean policy functions aligned to `authz.yaml`: deny unrelated access, self-acceptance, duplicate/out-of-window confirmation, release without dual confirmation, admin arbitration. |
| `lib/cache/revalidate.ts` | Centralize revalidation tags/paths: Vouch, user Vouches, payments, verification, admin, audit. |
| `lib/errors/action-errors.ts` | Typed action error codes and helpers to convert Zod/authz/provider failures into `ActionResult`. |

## Integrations / Provider Matrix

| File | Generate / complete |
|---|---|
| `lib/integrations/clerk/webhooks.ts` | Verify Clerk/Svix webhook, parse supported events: `user.created`, `user.updated`, `user.deleted`. |
| `lib/clerk/process-clerk-webhook.ts` | Orchestrate idempotent Clerk event processing through `ProviderWebhookEvent`, user transactions, audit. |
| `lib/clerk/webhook-events.ts` | Supported Clerk event constants and safe event normalization. |
| `lib/integrations/stripe/client.ts` | Server-only Stripe SDK client from env. Never export secrets to browser. |
| `lib/integrations/stripe/connect.ts` | Connected account onboarding/account refresh helpers. |
| `lib/integrations/stripe/identity.ts` | Stripe Identity session/verification helpers. |
| `lib/integrations/stripe/payment-intents.ts` | PaymentIntent authorize/capture/cancel/refund or transfer helpers according to provider design. |
| `lib/integrations/stripe/webhooks.ts` | Raw body signature verification and safe event normalization. |
| `lib/payments/adapters/stripe-payment-adapter.ts` | Provider adapter interface implementation used by actions/jobs/webhooks. |
| `lib/payments/webhooks/process-stripe-webhook.ts` | Idempotent Stripe payment webhook processor using `ProviderWebhookEvent` and `PaymentWebhookEvent`. |
| `lib/verification/webhooks/process-stripe-identity-webhook.ts` | Idempotent Stripe Identity webhook processor updating verification profile only from verified provider events. |
| `lib/stripe/client.ts` | If retained, wrap or re-export integration client; avoid second independent Stripe client setup. |
| `lib/stripe/config.ts` | Stripe config constants/env-derived settings. |
| `lib/stripe/status-map.ts` | Map Stripe statuses to Vouch payment/readiness statuses. |
| `lib/stripe/webhook-events.ts` | Supported Stripe event constants. |

## Domain Services / Jobs / Utilities Matrix

| File | Generate / complete |
|---|---|
| `lib/vouch/fees.ts` | Deterministic platform fee calculation and bounds from constants. |
| `lib/vouch/resolution.ts` | Pure resolution decisions: complete only on both confirmed; otherwise expire/refund/void/non-capture. |
| `lib/vouch/state.ts` | Allowed lifecycle transitions and exhaustive checks for `pending`, `active`, `completed`, `expired`, `refunded`, `canceled`, `failed`. |
| `lib/vouch/status.ts` | UI/status helper labels and next-action derivation without business mutation. |
| `lib/vouch/time-windows.ts` | Confirmation window calculations and open/closed predicates. |
| `lib/invitations/tokens.ts` | Generate secure invite token, hash token, verify lookup hash. Never store plaintext. |
| `lib/jobs/expire-vouches.ts` | Find pending/active expired Vouches and run idempotent expiration/refund/non-capture flow. |
| `lib/jobs/reconcile-payments.ts` | Reconcile provider payment/refund status with local records idempotently. |
| `lib/notifications/queue.ts` | Queue and send notification events through email provider with delivery status updates. |
| `lib/integrations/email/provider.ts` | Email provider abstraction. Do not block core transactions on non-critical email send. |
| `lib/integrations/email/templates.ts` | Invite, accepted, confirmation window open, confirmation recorded, completed, expired/refunded, payment failed templates. |
| `lib/webhooks/provider-webhook-ledger.ts` | Generic idempotency helpers for `ProviderWebhookEvent` across Clerk/Stripe/Stripe Identity. |
| `lib/webhooks/provider-webhook-status.ts` | Status constants/helpers for received/processed/ignored/failed. |
| `lib/security/hash.ts` | Token/hash helpers for invite tokens, IP/user agent hashes where used. |
| `lib/security/idempotency.ts` | Idempotency key helpers for provider and action retry operations. |
| `lib/security/rate-limit.ts` | Rate limit wrappers for public invite/auth-sensitive actions if enabled by env. |
| `lib/security/request.ts` | Safe request metadata extraction: request ID, IP hash, user agent hash. |
| `lib/setup/status.ts` | Pure setup readiness derivation. |
| `lib/observability/logger.ts` | Safe structured logging. No secrets/provider payloads. |
| `lib/constants/*.ts` | Central constants for app metadata, routes, cache tags, limits, providers, statuses, terms version, admin safe retry operations. |
| `lib/env.ts` | Validate required env for Next/Clerk/Stripe/Neon/email/rate-limit as used. |
| `lib/utils.ts`, `lib/utils/cn.ts` | Keep generic helpers only; no domain logic. |

## Prisma Alignment Notes

- Current Prisma schema already contains required core entities and forbidden marketplace/dispute entities are absent.
- `ProviderWebhookEvent` resolves the generic idempotency ledger need for Clerk, Stripe, and Stripe Identity.
- `ConfirmationMethod` includes `gps`, but GPS confirmation is deferred by project instructions. Do not implement GPS behavior unless explicitly requested.
- `NotificationEvent` uses `eventName` and `errorCode`; generated notification code must not assume fields named `type` or `failureCode`.
- `PaymentRecord` has `lastErrorCode` but no `lastErrorMessage`; do not generate code that writes a non-existent `lastErrorMessage`.
- `User` has no `lastSignedInAt`; do not generate code that writes it unless schema/contracts are updated.

## Acceptance Gates To Check During Implementation

- Contract integrity: enums/routes/actions match `.agents/contracts/*`.
- Domain integrity: no forbidden entities/routes/DTOs.
- Auth enforcement: participant/admin/setup gates are server-side.
- Vouch create: validates readiness, amount, terms, payment setup, audit, invite.
- Vouch accept: valid token, not payer, payee readiness, active transition, audit, notification.
- Confirmation: active participant, active Vouch, open window, no duplicate, dual confirmation required for release.
- Deterministic resolution: incomplete confirmation expires then refunds/voids/non-captures.
- Webhooks: signature verified, idempotent ledger, safe metadata, audit.
- Admin: operational read/safe retry only, no arbitration.
- Caching: protected reads are dynamic/no-store; mutations revalidate centralized tags.
