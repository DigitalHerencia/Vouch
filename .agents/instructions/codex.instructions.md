# Codex Instructions

Use these instructions for implementation work in this repo.

## Operating Rules

- Treat `.agents` as the active governance directory. Do not use old `.codex` assumptions.
- Make the smallest correct change.
- Preserve route, feature, component, lib, schema, and type boundaries.
- Do not invent business rules, routes, product surfaces, database fields, or legal copy.
- Use pnpm.
- Do not run dev servers, migrations, deployments, broad tests, or builds unless explicitly requested.
- If validation is allowed, run the narrowest relevant command before finishing.
- If validation is explicitly disallowed, report that it was not run.

## Stripe Rules

- Use Stripe Connect direct charges for customer deposits.
- Scope customer deposit PaymentIntent and Checkout Session operations to the connected account.
- Use manual capture for customer deposits.
- Treat the connected business as the merchant of record and negative-balance liable party.
- Never set `application_fee_amount` on customer deposit transactions.
- Never set `transfer_data.destination` on customer deposit transactions.
- Never route customer deposit funds through the platform account.
- Charge the merchant protocol fee separately on the platform account.
- Require successful platform protocol-fee payment before issuing the customer authorization link.
- Require customer authorization before the appointment timestamp.
- Never confuse Connect onboarding with saving a reusable payment method to the user's platform Customer.
- Accept any reusable Stripe-supported payment method attached to the platform Customer as payment-method readiness.
- Do not bypass or weaken Stripe-required identity or business verification.
- Use idempotency keys for Stripe mutation calls.
- Store enough IDs to re-query direct-charge objects with connected-account scope.
- Webhook processing must be idempotent.
- The second valid bilateral confirmation must trigger immediate capture in the request path.
- Cron is recovery-only. Never make normal capture depend on cron.
- Never capture from offline, late, one-sided, or out-of-window confirmation.

## Vouch Lifecycle Rules

- Keep the new-Vouch wizard in this order: per-Vouch disclaimer, appointment and amount, review and protocol fee.
- Persist disclaimer acceptance per Vouch; do not substitute the one-time account user agreement.
- Allow Vouch creation only during the 24 hours immediately before a future appointment.
- Calculate confirmation open and close as appointment minus and plus one hour.
- Expire customer authorization Checkout at the appointment timestamp, not at confirmation close.
- Associate a customer to the Vouch only through the completed Vouch-specific authorization Checkout claim flow.
- Keep confirmation codes and controls unavailable outside the confirmation window and after successful capture.
- Retry capture only when bilateral confirmations arrived inside the window and the immediate capture attempt failed.
- Never capture after the technical recovery cutoff 24 hours after the appointment.
- Derive dashboard and detail state from canonical Prisma state synchronized with Stripe.

## Readiness Rules

- Payment-method readiness is mandatory to unlock dashboard operational interactivity.
- Connect onboarding, charge capability, and payout capability are mandatory to unlock the new-Vouch form.
- Keep dashboard payment-method readiness and new-Vouch Connect readiness as separate gates.
- Requirement notices remain visible and operational components remain disabled until canonical Prisma readiness is synchronized.
- Re-sync provider readiness when returning from Stripe and when a locked surface is loaded.

## Environment And Provider Operations

- Development uses Vouch Stripe sandbox; production uses Vouch Stripe live.
- Use `pnpm dev` as the canonical local entrypoint; it owns the local server, Clerk ngrok tunnel, and Stripe sandbox listener lifecycle.
- Use ngrok only for Clerk development webhook ingress. Use the Stripe CLI listener for Stripe development webhooks.
- Do not use or mutate the separate Vouch Stripe testing context until the user explicitly assigns it a purpose.
- Keep development and production secrets distinct.
- Do not edit Clerk environment variables or webhook configuration without explicit user approval.
- Do not mutate Stripe live configuration, accounts, data, webhooks, or payments without explicit user approval.
- Complete and verify the entire sandbox lifecycle before a live-readiness pass.
- Preview deployments are disabled; only `main` automatically deploys.
- Keep Vercel Hobby reconciliation once daily until the user explicitly approves an infrastructure upgrade.
- Do not add QStash, another scheduler, or a Neon development branch unless explicitly requested.
- Provider MCP or CLI operations must respect these environment boundaries. If provider identity is uncertain, stop before mutation.

## Clerk Rules

- Do not create or synchronize local users from authenticated reads or Server Actions.

- Clerk owns authentication and sessions.
- Prisma owns product state.
- Sync Clerk users into local users through verified webhooks.
- Do not create local users in middleware.
- Do not use Clerk metadata as canonical payment, product, role, deposit, or confirmation state.
- Use `auth()` for server-side auth checks.
- Use `currentUser()` only when full Clerk profile data is required.
- Keep Clerk and Stripe webhook routes public at middleware level and signature-verified in handlers.

## Prisma And Data Rules

- Prisma does not appear in `app`, `features`, or `components`.
- Fetchers enforce tenant/user boundaries and return DTOs.
- Server actions follow `auth -> authz -> Zod parse -> transaction/write -> audit/log -> revalidate`.
- Prisma models must not leak directly to UI.
- Store Stripe IDs, platform fee state, deposit state, confirmation state, webhook event IDs, and operation idempotency keys in the database.

## UI And Route Rules

- Public pages stay direct in route files unless the task requires flow orchestration.
- Authenticated flow assembly belongs in `features`.
- Reusable presentation belongs in `components`.
- shadcn primitives belong only in `components/ui`.
- Do not add forbidden surfaces or routes from `.agents/contracts/vouch-governance.yaml`.

## Conflict Handling

Stop and report before editing when:

- `.agents/docs` conflicts with `.agents/contracts`.
- Existing code enforces a business rule contradicted by active governance.
- Stripe or Clerk API constraints make the documented architecture impossible.
- A requested change requires a forbidden product surface.
- A requested provider mutation could affect Stripe live, Clerk configuration, or an unidentified environment.
