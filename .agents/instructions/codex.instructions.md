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
- Never set `application_fee_amount` on customer deposit transactions.
- Never set `transfer_data.destination` on customer deposit transactions.
- Never route customer deposit funds through the platform account.
- Charge the merchant protocol fee separately on the platform account.
- Use idempotency keys for Stripe mutation calls.
- Store enough IDs to re-query direct-charge objects with connected-account scope.
- Webhook processing must be idempotent.

## Clerk Rules

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
