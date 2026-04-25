
# Code of Conduct

## Purpose

This project is maintained for serious technical work on Vouch, a commitment-backed payment coordination system.

Contributors are expected to keep discussion focused on implementation quality, product constraints, security, correctness, and maintainability.

## Expected Behavior

Expected behavior includes:

* direct, respectful technical communication
* clear reproduction steps for bugs
* good-faith review comments
* respect for project boundaries
* no attempts to introduce forbidden product concepts
* no public disclosure of secrets, vulnerabilities, or private provider details

## Unacceptable Behavior

Unacceptable behavior includes:

* harassment, threats, or personal attacks
* spam
* doxxing
* publishing secrets
* intentionally bypassing security controls
* introducing arbitration, dispute, marketplace, messaging, review, or reputation features against project governance
* using the issue tracker for non-project disputes

## Enforcement

Maintainers may close issues, block contributors, remove comments, or revoke access when behavior interferes with the project.

## Reporting

Report conduct concerns to:

* support@example.com
  '@

  "CONTRIBUTING.md" = @'

# Contributing

## Status

Vouch is currently a tightly scoped product build. Contributions should preserve the core product model and architecture.

## Source of Truth

Follow this order:

1. `.agents/docs/*.md` — human intent
2. `.agents/contracts/*.yaml` — deterministic rules
3. `.agents/instructions/*.instructions.md` — implementation guidance
4. existing code
5. implementation judgment

If contracts conflict with docs, stop and report the conflict.

## Product Boundaries

Do not add:

* provider profiles
* public profiles
* listings
* search/discovery
* marketplace categories
* recommendations
* featured providers
* ratings or reviews
* reputation scores
* messaging
* dispute cases
* evidence uploads
* appeals
* admin fund-award controls
* manual release overrides
* confirmation rewrites

Forbidden route concepts:

```txt
/browse
/providers
/messages
/reviews
/categories
/disputes
```

## Architecture Rules

Use this structure:

```txt
app/                    route shell only
features/               page/view orchestration
components/             pure reusable UI
components/ui/          shadcn-style primitives
lib/fetcher/            server reads
lib/actions/            server mutations
lib/db/selects/         Prisma projections
lib/db/transactions/    DB mutation primitives
lib/db/mappers/         DTO mapping
lib/auth/               auth helpers
lib/authz/              authorization helpers
schemas/                Zod validation
types/                  schema-derived/domain types
```

## Server-First Rules

* Auth, authz, payment, confirmation, lifecycle transitions, and provider calls stay server-side.
* Components must not import Prisma, Stripe, Clerk server helpers, or server actions directly unless they are intentional client forms wired by features.
* Fetchers return transport-safe data only.
* Actions must authenticate, authorize, validate, transact, audit, revalidate, and return typed results.

## Branches

Use descriptive branches:

```txt
feature/create-vouch-flow
fix/confirmation-window-boundary
chore/prisma-schema-indexes
docs/readme-scope-clarity
```

## Commits

Prefer concise conventional-style commits:

```txt
feat(vouches): add create flow shell
fix(authz): block self-acceptance
chore(prisma): add participant dashboard indexes
docs(security): clarify webhook handling
```

## Pull Request Requirements

Before opening a pull request:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm test
```

Run Playwright when touching app routes or core flows:

```bash
pnpm test:e2e
```

## Review Checklist

Every PR should answer:

* Does this preserve Vouch’s core lifecycle?
* Does this avoid marketplace/dispute/arbitration features?
* Are reads routed through fetchers?
* Are writes routed through server actions and transactions?
* Are inputs validated with Zod?
* Are provider payloads minimized?
* Are audit events written where required?
* Are participant/admin authorization checks server-side?
* Are UI components presentational?
* Are tests or validation steps included?

## Security

Never commit secrets, raw provider payloads, raw identity documents, card data, or production exports.

Report vulnerabilities through `SECURITY.md`.