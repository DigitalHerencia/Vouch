# Codex Instructions

Use these instructions for implementation work in this repo.

## Operating Rules

- Treat root `AGENTS.md` as the repo manifest.
- Treat `context/docs` as durable human-readable context.
- Treat `.agents/contracts` as deterministic constraints.
- Treat `context/instructions` as implementation guidance.
- Treat `.agents/execution` as operational state tracking.
- Make the smallest correct change.
- Preserve route, feature, component, lib, schema, and type boundaries.
- Do not invent business rules, routes, product surfaces, database fields, or legal copy.
- Use pnpm.
- Do not run dev servers, migrations, deployments, broad tests, provider mutations, or builds unless explicitly requested.
- If validation is allowed, run the narrowest relevant command before finishing.
- If validation is explicitly disallowed, report that it was not run.

## Governance Workflow

Before changing product, architecture, auth, payment, database, route, workflow, or UI behavior:

1. Read `AGENTS.md`.
2. Read relevant files in `context/docs`.
3. Read relevant files in `.agents/contracts`.
4. Read relevant files in `context/instructions`.
5. Check `.agents/execution/handoff.json` and `.agents/execution/progress.json`.
6. Stop if governance conflicts with the request or with existing code.

After meaningful work:

- Update `.agents/execution/decisions.json` when a durable decision is made.
- Update `.agents/execution/progress.json` when task state changes.
- Update `.agents/execution/handoff.json` when current state or next-agent context changes.

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
- Do not bypass or weaken Stripe-required identity or business verification.
- Use idempotency keys for Stripe mutation calls.
- Store enough IDs to re-query direct-charge objects with connected-account scope.
- Webhook processing must be idempotent.
- The second valid bilateral confirmation must trigger immediate capture in the request path.
- Cron is recovery-only. Never make normal capture depend on cron.
- Never capture from offline, late, one-sided, or out-of-window confirmation.

## Readiness Rules

- Do not add platform payment-method setup, payment-method readiness state, or related CTAs.
- Connect onboarding, charge capability, and payout capability are mandatory to unlock the merchant new-Vouch form.
- Re-sync provider readiness when returning from Stripe and when a locked merchant surface is loaded.

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

## Environment And Provider Operations

- Development uses Vouch Stripe sandbox; production uses Vouch Stripe live.
- Use `pnpm dev` as the canonical local entrypoint; it owns the local server, Clerk ngrok tunnel, and Stripe sandbox listener lifecycle.
- Do not run `pnpm dev` unless explicitly requested.
- Use ngrok only for Clerk development webhook ingress.
- Use the Stripe CLI listener for Stripe development webhooks.
- Do not use or mutate the separate Vouch Stripe testing context until the user explicitly assigns it a purpose.
- Keep development and production secrets distinct.
- Do not edit Clerk environment variables or webhook configuration without explicit user approval.
- Do not mutate Stripe live configuration, accounts, data, webhooks, or payments without explicit user approval.
- Complete and verify the entire sandbox lifecycle before a live-readiness pass.
- Preview deployments are disabled; only `main` automatically deploys.
- Keep Vercel Hobby reconciliation once daily until the user explicitly approves an infrastructure upgrade.
- Do not add QStash, another scheduler, or a Neon development branch unless explicitly requested.
- Provider MCP or CLI operations must respect environment boundaries. If provider identity is uncertain, stop before mutation.

## Clerk Rules

- Clerk owns authentication and sessions.
- Prisma owns product state.
- Verified Clerk webhooks own local-user synchronization.
- Do not create or synchronize local users from authenticated reads or Server Actions.
- Do not create local users in middleware.
- Do not use Clerk metadata as canonical payment, product, role, deposit, authorization, or confirmation state.
- Use `auth()` for server-side auth checks.
- Use `currentUser()` only when full Clerk profile data is required.
- Keep Clerk and Stripe webhook routes public at middleware level and signature-verified in handlers.

## Prisma And Data Rules

- Prisma does not appear in `app`, `features`, or `components`.
- Fetchers enforce tenant/user boundaries and return DTOs.
- Server Actions follow `auth -> authz -> Zod parse -> transaction/provider write -> audit/log -> revalidate/redirect`.
- Prisma models must not leak directly to UI.
- Store Stripe IDs, platform fee state, deposit state, confirmation state, webhook event IDs, operation idempotency keys, and recovery state in the database.

## UI And Design Rules

- Public pages stay direct in route files unless the task requires flow orchestration.
- Authenticated flow assembly belongs in `features`.
- Reusable presentation belongs in `components`.
- shadcn/Base UI primitives belong only in `components/ui`.
- Design-system rules live in `context/docs/design-system.md` and `.agents/contracts/design.yaml`.
- Prefer existing primitives and shared components before creating new UI.
- Use token-backed styling.
- Do not add arbitrary brand colors, repeated arbitrary spacing values, or one-off visual systems.
- Do not use inline styles except for narrow dynamic runtime values that cannot reasonably be represented by classes or CSS variables.
- Reusable component additions or material changes require component inventory updates.
- Do not add forbidden surfaces or routes from `.agents/contracts/product.yaml`.

## Conflict Handling

Stop and report before editing when:

- `context/docs` conflicts with `.agents/contracts`.
- Existing code enforces a business rule contradicted by active governance.
- Stripe or Clerk API constraints make the documented architecture impossible.
- A requested change requires a forbidden product surface.
- A requested provider mutation could affect Stripe live, Clerk configuration, Neon branches, Vercel production, or an unidentified environment.
- A requested migration may destroy or rewrite data without explicit approval.
