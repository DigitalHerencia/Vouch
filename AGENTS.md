# Codex Agent Instructions

This repo uses `.agents` as the active Codex governance directory. Old `.codex` governance no longer applies.

## Required Reading

Before making product, architecture, auth, payment, database, route, or workflow changes, read:

1. `.agents/docs/product-redesign.md`
2. `.agents/docs/architecture.md`
3. `.agents/contracts/vouch-governance.yaml`
4. `.agents/instructions/codex.instructions.md`

Use `.agents/conflict-check.md` for known non-blocking source issues.

## Working Rules

- Make only the requested edits.
- Keep scope tight.
- Preserve existing behavior unless the task explicitly changes it.
- Do not invent product behavior, legal copy, business rules, roles, routes, or database fields.
- Use pnpm.
- Do not run dev servers, migrations, deployments, broad tests, or builds unless explicitly requested.
- If validation is allowed, run the narrowest relevant command before finishing.
- If validation is explicitly disallowed, report that validation was not run.

## Architecture Rules

- `app/` routes stay thin.
- `features/` orchestrates views, forms, Suspense, and user-flow assembly.
- `components/` contains reusable presentational UI only.
- `components/ui/` contains shadcn primitives only.
- `lib/` is server authority for auth, authz, db, actions, fetchers, integrations, cache, webhooks, and audit.
- `schemas/` owns Zod runtime contracts.
- `types/` owns DTOs and shared boundaries.
- Prisma models must not leak directly to UI.

## Payment Rules

- Merchant protocol fee and customer deposit authorization are separate Stripe flows.
- Customer deposit is a direct charge on the connected business account.
- Customer deposit uses manual capture.
- Never use destination charges for customer deposits.
- Never use separate charges and transfers for customer deposits.
- Never set `application_fee_amount` on customer deposit transactions.
- Never route customer deposit funds through the platform balance.

## Auth Rules

- Clerk owns auth and sessions.
- Prisma owns product state.
- Clerk metadata is not a source of truth for payments, deposits, confirmations, Stripe state, roles, or tenant access.
- Server-side auth and tenant authorization are mandatory for protected reads and writes.
