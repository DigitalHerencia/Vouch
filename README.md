# Vouch

Vouch is a commitment-backed payment coordination system for appointments and in-person agreements.

The core product rule is simple:

> Both parties confirm presence within the confirmation window → funds release. Otherwise → refund, void, or non-capture.

Vouch coordinates payment state through provider infrastructure such as Stripe / Stripe Connect. Vouch does not directly custody funds, store raw card data, store raw identity documents, arbitrate disputes, or decide which party is “right.”

## Product Boundaries

Vouch is not:

- a marketplace
- a scheduler
- an escrow provider
- a broker
- a social app
- a messaging app
- a review system
- a dispute-resolution platform

Do not introduce profiles, listings, search/discovery, categories, recommendations, featured providers, ratings, reviews, reputation scores, marketplace navigation, dispute cases, evidence uploads, appeals, or manual fund-award flows.

## Core Lifecycle

1. Payer creates a Vouch.
2. Payment authorization / commitment is initialized through the provider.
3. Payee accepts the Vouch.
4. Confirmation window opens.
5. Payer confirms presence.
6. Payee confirms presence.
7. If both confirmations occur within the window, release/capture/transfer is attempted through the payment provider.
8. If the required confirmations do not occur, the system refunds, voids, or does not capture according to provider state.

One-sided confirmation never releases funds.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Clerk
- Stripe / Stripe Connect
- Tailwind CSS
- shadcn/ui-style primitives
- Radix UI
- React Hook Form
- Zod
- Vitest
- Playwright
- pnpm

## Architecture

The project uses a server-first architecture.

```txt
app/                    route shell only
features/               page/view orchestration
components/             reusable presentational UI
components/ui/          shadcn-style primitives
lib/fetcher/            server reads
lib/actions/            server mutations
lib/db/selects/         Prisma projection constants
lib/db/transactions/    database mutation primitives
lib/db/mappers/         DTO/read-model mapping
lib/auth/               authentication helpers
lib/authz/              authorization helpers
schemas/                Zod validation and sanitization
types/                  domain types and schema-derived inputs
prisma/                 schema, migrations, seed
```

## Local Development

```bash
pnpm install
pnpm prisma:generate
pnpm db:migrate:dev
pnpm dev
```

## Validation

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm test
pnpm test:e2e
```

## Environment

Create `.env` from `.env.example`.

Required services:

- Clerk
- Neon PostgreSQL
- Stripe
- Stripe Connect
- Upstash Redis, if rate limiting is enabled

## Security

Do not commit secrets, provider payload dumps, card data, identity documents, webhook raw payload archives, or production database exports.

Report security issues through `SECURITY.md`.

## License

This repository is proprietary unless explicitly relicensed.
