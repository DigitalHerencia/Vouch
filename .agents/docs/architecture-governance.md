# Full-Stack Architecture Governance Standard

Source date: 2026-05-19

Applies to:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui or registry-based primitives
- PostgreSQL through a server-only DB layer
- Zod validation
- server actions
- provider integrations such as auth, payments, email, storage, or webhooks

This document is generalized for new projects. It is intentionally opinionated.

## What This Is

This is an architecture governance standard.

In plain English: it is the rulebook that says which layer owns which responsibility so the codebase does not turn into a pile of clever files that all know too much.

The proper terminology is:

- separation of concerns
- ownership boundaries
- dependency direction
- interface contracts
- orchestration layers
- pure rendering boundaries
- transport-safe data contracts
- server-side authority
- capability-based organization

This is not ceremony for its own sake. It exists so you can ask an agent for work and know where code should go before the agent starts improvising.

## Core Doctrine

Every file should have one primary architectural role.

```txt
routes select surfaces
layouts apply persistent structure
shells own route chrome
features orchestrate data and behavior
blocks assemble UI sections
components render pure UI
primitives provide reusable controls
actions perform writes
fetchers perform reads
auth identifies users
authz authorizes access
schemas validate input
types define contracts
db modules perform persistence mechanics
providers adapt external systems
webhooks reconcile external events
tests verify contracts and behavior
docs explain intent
```

The anti-pattern:

```txt
page.tsx imports auth, queries DB, shapes DTOs, contains form state, renders UI, calls providers, and handles errors.
```

That feels fast early and becomes impossible to govern later.

## Skill Level Reality Check

Not knowing where to put code is not a moral failure. It is a systems-design problem.

Modern web apps are not just "React pages." They are several systems stacked together:

- routing
- rendering
- styling
- server execution
- validation
- authorization
- persistence
- provider integration
- cache/revalidation
- accessibility
- deployment
- observability

Junior code often fails because these systems are mixed by accident. Senior code works because each layer has a name, a boundary, and a contract.

The goal is not to memorize jargon. The goal is to make the jargon useful enough that the next implementation decision becomes boring.

## Architecture Categories

### Namespace

A namespace is a stable naming label used across folders and files.

Examples:

```txt
auth
authz
billing
dashboard
marketing
navigation
notifications
ops
payments
settings
system
user
verification
```

A namespace is not always a business domain. It can represent a product capability, platform capability, UI surface, route group, operational concern, or tooling area.

### Domain

A domain is a capability that owns rules, state, lifecycle, persistence, provider coordination, security, or workflow truth.

Examples:

```txt
auth
authz
billing
payments
verification
orders
projects
messages
documents
audit
```

Use the word domain only when the namespace has domain rules or state. Static marketing sections, nav, CI/CD, configs, and visual layout are not domains unless they own rules.

### Platform Concern

A platform concern supports the app but is not usually a product domain.

Examples:

```txt
ci
deployment
logging
monitoring
analytics
email
storage
configuration
rate-limiting
feature-flags
```

These still deserve namespaces, contracts, and tests.

### Route Surface

A route surface is a user-facing App Router endpoint or route group.

Examples:

```txt
app/(public)
app/(auth)
app/(app)
app/(admin)
app/api
```

Routes are transport/rendering surfaces. They do not automatically own domain logic.

## Ownership Layers

### Root Layout

Owns:

- global metadata
- viewport policy
- global providers
- global font variable attachment
- root body baseline

Does not own:

- route-specific nav
- feature logic
- database access
- provider operations

Typical file:

```txt
app/layout.tsx
```

### Global CSS

Owns:

- CSS tokens
- Tailwind v4 `@theme` mappings
- typography taxonomy
- global background
- reset/base rules
- focus-visible behavior
- reduced motion behavior

Does not own:

- page-specific layout
- component-specific color decisions
- feature-specific styling
- route chrome

Typical file:

```txt
app/globals.css
```

### Route Group Layout

Owns:

- route shell selection
- persistent group structure
- loading/error boundary placement
- authenticated/unauthenticated group frame

Does not own:

- domain CRUD
- provider reconciliation
- DTO shaping

Typical files:

```txt
app/(public)/layout.tsx
app/(auth)/layout.tsx
app/(app)/layout.tsx
app/(admin)/layout.tsx
```

### Shell

Owns:

- header
- footer
- sidebar
- mobile chrome
- route frame
- responsive macro layout

Does not own:

- business mutations
- provider settlement/reconciliation
- raw DB access

Typical files:

```txt
components/shells/public-shell.tsx
components/shells/auth-shell.tsx
components/shells/app-shell.tsx
```

### Page

Owns:

- route endpoint selection
- params/searchParams boundary handoff
- rendering one feature
- rendering static public composition when no operation exists
- Suspense wrapper for dynamic features

Does not own:

- DB queries
- provider business logic
- protected DTO shaping
- form state orchestration
- mutations

Typical files:

```txt
app/(public)/pricing/page.tsx
app/(auth)/sign-in/page.tsx
app/(app)/dashboard/page.tsx
```

### Feature

Owns:

- feature orchestration
- server fetcher calls
- DTO branching
- passing actions to forms
- Suspense boundaries
- client interaction state in client feature files

Does not own:

- primitive UI implementation
- raw SQL
- provider SDK business logic
- reusable visual component library behavior

Typical files:

```txt
features/dashboard/dashboard-feature.tsx
features/dashboard/dashboard-feature.client.tsx
features/auth/sign-in-feature.tsx
features/payments/checkout-success-feature.tsx
```

Think of a feature as the marriage of pure UI assembly and business operation contracts. It is where the app says: "For this route, get this data, interpret this DTO state, render these blocks, wire these actions."

### Block

Owns:

- section assembly
- component composition
- repeated page surfaces
- layout inside a reusable page section

Does not own:

- protected reads
- writes
- authz
- provider calls

Typical files:

```txt
components/blocks/page-hero.tsx
components/blocks/settings-form-section.tsx
components/blocks/dashboard-table-section.tsx
components/blocks/checkout-summary-panel.tsx
```

### Component

Owns:

- pure UI rendering
- props-to-markup
- local presentational state
- primitive composition

Does not own:

- server actions
- fetchers
- database access
- auth/authz
- provider SDKs
- domain truth

Typical files:

```txt
components/dashboard/project-card.tsx
components/auth/sign-in-form.tsx
components/navigation/sidebar.tsx
```

### UI Primitive

Owns:

- low-level accessible control behavior
- variants
- primitive styling contract

Does not own:

- domain language
- business rules
- protected data

Typical files:

```txt
components/ui/button.tsx
components/ui/input.tsx
components/ui/dialog.tsx
components/ui/card.tsx
```

Registry primitives should be treated as vendor-like source. Modify them intentionally, not casually.

## Server Operation Layers

### Auth

Auth identifies the user.

Owns:

- session lookup
- provider identity mapping
- local user/account context

Does not own:

- permission decisions
- business mutations

Typical files:

```txt
lib/auth/session.ts
lib/auth/user.ts
lib/auth/account.ts
```

### Authz

Authz decides whether the authenticated user may do something.

Owns:

- policies
- assertions
- capabilities
- participant/owner/tenant scope

Does not own:

- mutations
- provider calls
- UI data fetching

Typical files:

```txt
lib/authz/assertions.ts
lib/authz/capabilities.ts
lib/authz/policies.ts
lib/authz/participants.ts
```

### Actions

Actions are protected writes.

Sequence:

```txt
authenticate
-> authorize
-> validate
-> transaction/provider operation
-> audit/log
-> revalidate/redirect
-> typed result
```

Typical files:

```txt
lib/actions/projectActions.ts
lib/actions/paymentActions.ts
lib/actions/userActions.ts
```

### Fetchers

Fetchers are protected reads.

Sequence:

```txt
authenticate
-> authorize
-> minimal select
-> map to DTO
-> apply cache policy
-> return transport-safe data
```

Typical files:

```txt
lib/fetchers/dashboardFetchers.ts
lib/fetchers/projectFetchers.ts
lib/fetchers/userFetchers.ts
```

### DB Client

The DB client is server-only infrastructure.

Typical file:

```txt
lib/db/client.ts
```

Rules:

- one shared server-only client module
- no imports from client components
- no UI labels
- no route rendering

### DB Selects

Selects define minimal persistence read shapes.

Typical files:

```txt
lib/db/selects/project.ts
lib/db/selects/user.ts
lib/db/selects/payment.ts
```

Selects are not automatically DTOs. A select is the database read shape. A DTO is the transport-safe result.

### DTO Mappers

DTO mappers convert persistence/provider state into UI-safe contracts.

Typical files:

```txt
lib/mappers/projectMappers.ts
lib/mappers/paymentMappers.ts
```

Acceptable small-project compromise:

```txt
mapper functions colocated in fetchers
```

But raw Prisma/provider objects must still not leak to UI.

### Transactions

Transactions own atomic mutation sequences.

Typical files:

```txt
lib/db/transactions/project.ts
lib/db/transactions/payment.ts
```

Transactions should receive already-validated, already-authorized inputs or explicit authorization context.

### Providers

Provider modules adapt external services.

Examples:

```txt
lib/providers/stripe.ts
lib/providers/clerk.ts
lib/providers/sendgrid.ts
lib/providers/storage.ts
```

Provider modules should hide SDK details from actions, fetchers, and webhooks when possible.

### Webhooks

Webhooks reconcile external provider events.

Sequence:

```txt
read raw body
-> verify signature
-> parse event envelope
-> classify event type
-> record provider event id
-> process idempotently
-> return provider-compatible response
```

Typical files:

```txt
app/api/webhooks/stripe/route.ts
app/api/webhooks/clerk/route.ts
```

Webhooks do not depend on browser user sessions. They use provider authenticity plus idempotency.

## Naming Standard

Use simple descriptive names.

Root-level namespace files include the namespace:

```txt
types/authzTypes.ts
schemas/authzSchemas.ts
lib/actions/authzActions.ts
lib/fetchers/authzFetchers.ts
```

Files inside namespace directories do not repeat the namespace:

```txt
lib/authz/assertions.ts
lib/authz/capabilities.ts
lib/authz/participants.ts
lib/authz/policies.ts
```

React files use lowercase hyphenated names:

```txt
authz-feature.tsx
authz-feature.client.tsx
authz-skeleton.tsx
authz-table.tsx
authz-form.tsx
```

Next route files use framework names:

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
route.ts
```

## Recommended Folder Blueprint

```txt
app/
  layout.tsx
  globals.css
  (public)/
  (auth)/
  (app)/
  (admin)/
  api/

components/
  ui/
  blocks/
  shells/
  navigation/
  shared/
  {namespace}/

features/
  {namespace}/
    {namespace}-feature.tsx
    {namespace}-feature.client.tsx
    {namespace}-skeleton.tsx

content/
  {namespace}.ts

lib/
  actions/
  auth/
  authz/
  db/
    client.ts
    selects/
    transactions/
  fetchers/
  mappers/
  providers/
  utils/

schemas/
  {namespace}Schemas.ts

types/
  {namespace}Types.ts

tests/
  unit/
  integration/
  contract/
  e2e/

.agents/
  docs/
  instructions/
  contracts/
  execution/
```

## Security Rules

- Authenticate before protected access.
- Authorize before protected access.
- Validate user-controlled input with Zod.
- Use minimal selects.
- Map to DTOs before rendering.
- Never expose raw provider payloads to UI.
- Never expose raw card, bank, identity, secret, or KYC data.
- Keep webhook processing idempotent.
- Record provider event IDs.
- Use transactions for multi-step writes.
- Retrieve provider state before irreversible payment/settlement decisions.
- Keep provider secrets server-only.

## Performance Rules

- Keep server components server-first where possible.
- Move client components only where interactivity requires it.
- Keep route pages thin.
- Fetch the smallest useful dataset.
- Avoid repeated provider calls inside render paths.
- Use cache/revalidation intentionally.
- Keep large provider payloads out of DTOs.
- Prefer stable DTO shapes over ad hoc response objects.
- Avoid unnecessary global client providers.

## Accessibility Rules

- Use semantic elements where possible.
- Use accessible primitives for dialogs, menus, selects, popovers, and form controls.
- Preserve keyboard focus.
- Keep visible focus styles.
- Respect reduced motion.
- Do not encode state by color alone.
- Buttons trigger actions. Links navigate.

## Decision Points To Ask The User

Do not silently decide these unless the project already has a clear convention:

- Is this a product domain, platform concern, or UI namespace?
- Should this route be static composition or feature orchestration?
- Should this data shape be a DB select, DTO, or UI view model?
- Should labels be mapped in DTOs or content modules?
- Should a component live in `components/blocks`, `components/shared`, or `components/{namespace}`?
- Should provider SDK details be wrapped in a provider adapter first?
- Should a mutation be a server action, webhook transaction, or internal service operation?
- Is the primitive registry code allowed to be modified?

Asking these questions is not weakness. It is how architecture stays deterministic.

## Agent Prompt Template

Use this when asking an agent to implement work:

```txt
Classify the task by layer before editing.
Use this ownership model:
- pages select
- layouts/shells frame
- features orchestrate
- blocks assemble
- components render
- primitives control UI behavior
- fetchers read
- actions write
- auth/authz gate access
- schemas validate
- DTOs transport safe data
- transactions persist atomically

Before editing, state:
- layer classification
- owner files
- allowed dependencies
- forbidden dependencies avoided
- ambiguity that requires user decision

Do not modify primitives, registry components, provider integrations, or config files unless explicitly in scope.
```
