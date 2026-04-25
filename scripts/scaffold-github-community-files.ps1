#Requires -Version 7.0

<#
.SYNOPSIS
  Scaffolds GitHub community, governance, and repo health files for Vouch.

.DESCRIPTION
  Creates:
  - README.md
  - LICENSE
  - SUPPORT.md
  - SECURITY.md
  - CODE_OF_CONDUCT.md
  - CONTRIBUTING.md
  - ROADMAP.md
  - CHANGELOG.md
  - GOVERNANCE.md
  - .github/CODEOWNERS
  - .github/pull_request_template.md
  - .github/ISSUE_TEMPLATE/config.yml
  - .github/ISSUE_TEMPLATE/bug_report.yml
  - .github/ISSUE_TEMPLATE/feature_request.yml
  - .github/ISSUE_TEMPLATE/docs_change.yml
  - .github/FUNDING.yml

.NOTES
  Default license is proprietary All Rights Reserved.
  Change LICENSE only if intentionally open-sourcing.
#>

param(
  [string]$Root = (Get-Location).Path,
  [string]$CodeOwner = "@DigitalHerencia",
  [string]$SecurityContact = "security@example.com",
  [string]$SupportContact = "support@example.com",
  [string]$CopyrightOwner = "Ivan P. Roman / Digital Herencia",
  [int]$Year = (Get-Date).Year,
  [switch]$Overwrite,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Write-Step {
  param([string]$Message)
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Skip {
  param([string]$Message)
  Write-Host "skip: $Message" -ForegroundColor DarkGray
}

function Ensure-Directory {
  param([string]$Path)

  if ($DryRun) {
    Write-Host "mkdir $Path"
    return
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    [System.IO.Directory]::CreateDirectory($Path) | Out-Null
  }
}

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $parent = Split-Path -Parent $Path
  Ensure-Directory -Path $parent

  if ((Test-Path -LiteralPath $Path) -and -not $Overwrite) {
    Write-Skip $Path
    return
  }

  if ($DryRun) {
    Write-Host "write $Path"
    return
  }

  [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
  Write-Host "wrote: $Path"
}

Write-Step "Scaffolding GitHub community files"

$files = [ordered]@{
  "README.md" = @'
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
````

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

* Clerk
* Neon PostgreSQL
* Stripe
* Stripe Connect
* Upstash Redis, if rate limiting is enabled

## Security

Do not commit secrets, provider payload dumps, card data, identity documents, webhook raw payload archives, or production database exports.

Report security issues through `SECURITY.md`.

## License

This repository is proprietary unless explicitly relicensed.
'@

"LICENSE" = @'
Copyright (c) **YEAR** **COPYRIGHT_OWNER**

All rights reserved.

This software and associated documentation files are proprietary and confidential. No permission is granted to use, copy, modify, merge, publish, distribute, sublicense, sell, host, reverse engineer, or create derivative works from this software without prior written permission from the copyright holder.

Unauthorized use, reproduction, or distribution of this software is prohibited.

This license does not grant any rights to trademarks, service marks, brand names, logos, trade names, or payment/financial-process designs associated with the project.

THE SOFTWARE IS PROVIDED "AS IS" FOR INTERNAL DEVELOPMENT PURPOSES ONLY, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, SECURITY, REGULATORY COMPLIANCE, OR NON-INFRINGEMENT.
'@

"SUPPORT.md" = @'

# Support

## Project Support

For project questions, implementation coordination, or repository access issues, contact:

* **SUPPORT_CONTACT**

## What to Include

When requesting support, include:

* clear description of the issue
* expected behavior
* actual behavior
* relevant route, feature, or module
* reproduction steps
* screenshots or terminal output when useful
* commit hash or branch name
* environment: local, preview, or production

## Security Issues

Do not report security vulnerabilities through public issues.

Use the process in `SECURITY.md`.

## Product Scope Reminder

Vouch is not a marketplace, scheduler, broker, escrow provider, messaging product, review system, or dispute-resolution system. Support requests that require those product surfaces should be treated as out of scope.
'@

"SECURITY.md" = @'

# Security Policy

## Supported Versions

Security fixes are applied to the active development branch and current production deployment.

| Version            | Supported |
| ------------------ | --------- |
| current production | yes       |
| active main branch | yes       |
| archived branches  | no        |

## Reporting a Vulnerability

Do not open a public GitHub issue for a suspected vulnerability.

Report security concerns to:

* **SECURITY_CONTACT**

Include:

* affected route, API route, webhook, or provider integration
* reproduction steps
* expected impact
* whether data, payment state, authz, or lifecycle state may be affected
* relevant logs with secrets removed
* whether the issue affects local, preview, or production

## High-Risk Areas

Pay special attention to:

* Clerk session handling
* Clerk webhook verification
* Stripe webhook verification
* Stripe / Connect payment state transitions
* authorization checks for Vouch participants
* admin operational views
* confirmation-window logic
* duplicate confirmation prevention
* invite token hashing
* server actions
* Prisma transaction boundaries
* audit logging
* rate limiting

## Non-Negotiables

The project must not store:

* raw card data
* raw identity documents
* full provider payloads
* secrets
* plaintext invite tokens
* unnecessary payment metadata
* private dispute/evidence artifacts

## Disclosure Expectations

Give maintainers reasonable time to investigate and patch before public disclosure.

## Out of Scope

The following are not security vulnerabilities by themselves:

* missing marketplace features
* lack of public profiles
* lack of messaging
* lack of reviews
* lack of dispute resolution
* lack of manual fund-award controls

Those omissions are intentional product boundaries.
'@

"CODE_OF_CONDUCT.md" = @'

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

* **SUPPORT_CONTACT**
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
'@

"ROADMAP.md" = @'

# Roadmap

## Product Principle

Vouch coordinates commitment-backed payments for appointments and in-person agreements.

Both parties confirm presence inside the confirmation window → funds release. Otherwise → refund, void, or non-capture.

## Phase 0 — Repo Foundation

* [ ] root configs
* [ ] Prisma schema
* [ ] Clerk setup
* [ ] Stripe / Connect setup
* [ ] app route shells
* [ ] feature stubs
* [ ] components and shadcn primitives
* [ ] types and schemas
* [ ] actions, fetchers, transactions, selects, mappers

## Phase 1 — Auth and Setup

* [ ] Clerk auth
* [ ] local user sync
* [ ] Clerk webhook verification
* [ ] setup checklist
* [ ] terms acceptance
* [ ] identity verification state
* [ ] adult verification state
* [ ] payment readiness
* [ ] payout readiness

## Phase 2 — Create and Accept Vouch

* [ ] create Vouch form
* [ ] amount validation
* [ ] confirmation window validation
* [ ] invite token generation and hashing
* [ ] email/share invite flow
* [ ] accept Vouch flow
* [ ] decline Vouch flow
* [ ] self-acceptance denial
* [ ] setup blockers

## Phase 3 — Confirmation Lifecycle

* [ ] payer confirmation
* [ ] payee confirmation
* [ ] duplicate confirmation prevention
* [ ] confirmation window enforcement
* [ ] aggregate confirmation status
* [ ] deterministic release/refund branching
* [ ] audit timeline

## Phase 4 — Payment Provider Integration

* [ ] Stripe customer/payment setup
* [ ] Stripe Connect onboarding
* [ ] payment authorization
* [ ] release/capture/transfer
* [ ] refund/void/non-capture
* [ ] webhook ledger
* [ ] payment reconciliation
* [ ] provider failure states

## Phase 5 — User Dashboard

* [ ] empty state
* [ ] action required
* [ ] pending Vouches
* [ ] active Vouches
* [ ] completed Vouches
* [ ] expired/refunded Vouches
* [ ] Vouch detail variants
* [ ] confirmation detail variants

## Phase 6 — Admin Operations

* [ ] admin dashboard
* [ ] admin Vouch list/detail
* [ ] admin users list/detail
* [ ] admin payments list/detail
* [ ] admin webhook events
* [ ] admin audit log
* [ ] safe idempotent retries only

## Explicitly Not Planned

* marketplace
* provider listings
* public profiles
* search/discovery
* ratings/reviews
* messaging
* dispute resolution
* evidence uploads
* manual fund awards
* manual confirmation rewrites
  '@

  "CHANGELOG.md" = @'

# Changelog

All notable project changes should be documented in this file.

The format loosely follows Keep a Changelog, but this is an internal/proprietary product unless relicensed.

## [Unreleased]

### Added

* Initial project governance files.
* GitHub community health files.
* Vouch architecture boundaries.
* Product scope guardrails.

### Changed

* Nothing yet.

### Fixed

* Nothing yet.

### Removed

* Nothing yet.

## Release Categories

Use these headings when relevant:

```txt
Added
Changed
Deprecated
Removed
Fixed
Security
```

'@

"GOVERNANCE.md" = @'

# Governance

## Project Definition

Vouch is a commitment-backed payment coordination system.

The governing rule is:

> Both parties confirm presence within the confirmation window → funds release. Otherwise → refund, void, or non-capture.

## Source Authority

Follow this source order:

1. `.agents/docs/*.md`
2. `.agents/contracts/*.yaml`
3. `.agents/instructions/*.instructions.md`
4. existing code
5. implementation judgment

If implementation conflicts with contracts, contracts win.

If contracts conflict with docs, stop and report the conflict.

## Non-Negotiables

### No Marketplace

Do not create:

* profiles
* listings
* search/discovery
* categories
* recommendations
* featured providers
* ratings/reviews
* reputation scores
* marketplace nav/routes

### No Arbitration

Do not create:

* dispute cases
* claims
* evidence uploads
* appeals
* admin award-funds actions
* manual release overrides
* confirmation rewrites

### No Direct Custody

Vouch coordinates payment state through provider infrastructure. Do not store raw card data, raw identity documents, full provider payloads, or secrets.

### Dual Confirmation Required

Funds release only when:

* Vouch is active
* payer confirmed within the confirmation window
* payee confirmed within the confirmation window
* provider release/capture/transfer succeeds or is provider-accepted

One-sided confirmation never releases funds.

## Admin Scope

Admins inspect operational state only.

Admins may perform safe idempotent retries when explicitly allowed.

Admins do not decide who is right.

## Change Control

Any change that affects the lifecycle, payment state machine, authz rules, admin capability, or data model must be checked against `.agents/contracts`.
'@

".github/CODEOWNERS" = @'

# CODEOWNERS

# GitHub requires listed owners to have write access to the repository.

* **CODE_OWNER**

# Governance and project intent

/.agents/ **CODE_OWNER**
/AGENTS.md **CODE_OWNER**
/README.md **CODE_OWNER**
/GOVERNANCE.md **CODE_OWNER**
/SECURITY.md **CODE_OWNER**

# Application routes and orchestration

/app/ **CODE_OWNER**
/features/ **CODE_OWNER**

# Shared UI

/components/ **CODE_OWNER**
/hooks/ **CODE_OWNER**

# Server authority

/lib/actions/ **CODE_OWNER**
/lib/fetcher/ **CODE_OWNER**
/lib/auth/ **CODE_OWNER**
/lib/authz/ **CODE_OWNER**
/lib/integrations/ **CODE_OWNER**

# Database layer

/prisma/ **CODE_OWNER**
/lib/db/ **CODE_OWNER**

# Validation and types

/schemas/ **CODE_OWNER**
/types/ **CODE_OWNER**

# Tooling and CI

/.github/ **CODE_OWNER**
/scripts/ **CODE_OWNER**
/package.json **CODE_OWNER**
/pnpm-lock.yaml **CODE_OWNER**
/next.config.ts **CODE_OWNER**
/tsconfig.json **CODE_OWNER**
/eslint.config.mjs **CODE_OWNER**
/prettier.config.mjs **CODE_OWNER**
'@

".github/pull_request_template.md" = @'

# Pull Request

## Summary

Describe what changed and why.

## Type

* [ ] Feature
* [ ] Fix
* [ ] Refactor
* [ ] Chore
* [ ] Docs
* [ ] Test
* [ ] Security

## Scope Guard

Confirm:

* [ ] Does not introduce marketplace behavior
* [ ] Does not introduce profiles, listings, ratings, reviews, messaging, or discovery
* [ ] Does not introduce disputes, evidence uploads, appeals, or manual fund awards
* [ ] Does not bypass dual confirmation for release
* [ ] Does not store raw card data, raw identity documents, secrets, or full provider payloads

## Architecture Checklist

* [ ] `app/` remains route-shell only
* [ ] page/view orchestration lives in `features/`
* [ ] reusable UI remains in `components/`
* [ ] reads go through `lib/fetcher/*`
* [ ] writes go through `lib/actions/*`
* [ ] DB mutations are isolated in `lib/db/transactions/*`
* [ ] Prisma query projections use `lib/db/selects/*`
* [ ] DTO/read-model mapping uses `lib/db/mappers/*`
* [ ] inputs are validated with Zod schemas
* [ ] authorization checks are server-side
* [ ] provider calls are server-side

## Validation

Paste command results or explain why not applicable.

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm test
pnpm test:e2e
```

## Screenshots / UI Notes

Attach screenshots for UI changes.

## Risk Notes

List payment, auth, authz, lifecycle, data migration, or deployment risks.

## Follow-Up

List known follow-up tasks.
'@

".github/ISSUE_TEMPLATE/config.yml" = @'
blank_issues_enabled: false
contact_links:

* name: Security vulnerability
  url: mailto:**SECURITY_CONTACT**
  about: Do not open public issues for security vulnerabilities.
* name: Support
  url: mailto:**SUPPORT_CONTACT**
  about: Use this for access, setup, or operational support.
  '@

".github/ISSUE_TEMPLATE/bug_report.yml" = @'
name: Bug report
description: Report a reproducible defect.
title: "[Bug]: "
labels:

* bug
* triage
  body:
* type: markdown
  attributes:
  value: |
  Use this for implementation defects only. Do not report security vulnerabilities here.
* type: textarea
  id: summary
  attributes:
  label: Summary
  description: What is broken?
  validations:
  required: true
* type: textarea
  id: expected
  attributes:
  label: Expected behavior
  validations:
  required: true
* type: textarea
  id: actual
  attributes:
  label: Actual behavior
  validations:
  required: true
* type: textarea
  id: reproduce
  attributes:
  label: Reproduction steps
  value: |
  1.
  2.
  3.
  validations:
  required: true
* type: dropdown
  id: area
  attributes:
  label: Area
  options:
  - auth
  - setup
  - payments
  - vouches
  - confirmation
  - dashboard
  - admin
  - database
  - UI
  - tests
  - docs
  - other
  validations:
  required: true
* type: textarea
  id: logs
  attributes:
  label: Logs / screenshots
  description: Remove secrets, tokens, webhook signatures, and provider payloads.
  validations:
  required: false
* type: checkboxes
  id: scope
  attributes:
  label: Scope confirmation
  options:
  - label: This does not request marketplace, messaging, reviews, or dispute-resolution features.
  required: true
  - label: This does not disclose secrets or security vulnerabilities.
  required: true
  '@

".github/ISSUE_TEMPLATE/feature_request.yml" = @'
name: Feature request
description: Propose a scoped product or implementation change.
title: "[Feature]: "
labels:

* enhancement
* triage
  body:
* type: markdown
  attributes:
  value: |
  Feature requests must preserve Vouch's product boundaries.
* type: textarea
  id: problem
  attributes:
  label: Problem
  description: What problem does this solve?
  validations:
  required: true
* type: textarea
  id: proposal
  attributes:
  label: Proposal
  description: What should change?
  validations:
  required: true
* type: dropdown
  id: area
  attributes:
  label: Area
  options:
  - auth
  - setup
  - payments
  - vouches
  - confirmation
  - dashboard
  - admin operations
  - UI
  - docs
  - testing
  - other
  validations:
  required: true
* type: checkboxes
  id: boundaries
  attributes:
  label: Product boundaries
  options:
  - label: This is not a marketplace, profile, listing, discovery, rating, review, message, or dispute feature.
  required: true
  - label: This does not allow one-sided confirmation to release funds.
  required: true
  - label: This does not create manual admin fund-award or confirmation-rewrite powers.
  required: true
  '@

".github/ISSUE_TEMPLATE/docs_change.yml" = @'
name: Documentation change
description: Request or propose documentation changes.
title: "[Docs]: "
labels:

* documentation
* triage
  body:
* type: textarea
  id: docs_area
  attributes:
  label: Documentation area
  description: Which doc, section, or concept needs attention?
  validations:
  required: true
* type: textarea
  id: change
  attributes:
  label: Requested change
  description: What should be clarified, added, corrected, or removed?
  validations:
  required: true
* type: textarea
  id: source
  attributes:
  label: Source of truth
  description: Link or reference the relevant `.agents` source, contract, or code.
  validations:
  required: false
  '@

".github/FUNDING.yml" = @'

# Funding is intentionally unset for this proprietary product repository.

# Add GitHub Sponsors, Open Collective, Ko-fi, or custom links only if this project is intentionally opened for public funding.

'@
}

foreach ($relativePath in $files.Keys) {
$content = $files[$relativePath]
$content = $content.Replace("**CODE_OWNER**", $CodeOwner)
$content = $content.Replace("**SECURITY_CONTACT**", $SecurityContact)
$content = $content.Replace("**SUPPORT_CONTACT**", $SupportContact)
$content = $content.Replace("**COPYRIGHT_OWNER**", $CopyrightOwner)
$content = $content.Replace("**YEAR**", [string]$Year)

Write-TextFile -Path (Join-Path $Root $relativePath) -Content $content
}

Write-Step "Done"
Write-Host "Generated GitHub community and repository health files." -ForegroundColor Green
Write-Host "Review placeholders:" -ForegroundColor Yellow
Write-Host "  CodeOwner:       $CodeOwner"
Write-Host "  SecurityContact: $SecurityContact"
Write-Host "  SupportContact:  $SupportContact"
Write-Host "  CopyrightOwner:  $CopyrightOwner"

