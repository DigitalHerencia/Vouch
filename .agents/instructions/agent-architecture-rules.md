# Agent Architecture Rules

Source date: 2026-05-19

These rules are generalized for new Next.js App Router projects using TypeScript, Tailwind CSS v4, shadcn-compatible primitives, Zod, server actions, and a server-only database layer.

## First Move

Before editing, classify the request by layer:

```txt
root layout
global CSS/tokens
route group layout
shell/chrome
page
feature orchestration
block assembly
pure component
UI primitive
server action
fetcher
auth/authz
schema/type
db select/transaction
provider adapter
webhook
test/doc/config
```

If the owner layer is unclear, ask before editing.

## Architecture Rules

- Pages select surfaces. They do not become business logic containers.
- Public/static pages may compose static components directly.
- Dynamic/protected pages should render features.
- Features orchestrate data, actions, DTOs, Suspense, and business-state branching.
- Blocks assemble UI sections from components and primitives.
- Components render props and stay pure.
- UI primitives provide low-level accessible controls and variants.
- Fetchers read.
- Actions write.
- Auth identifies.
- Authz authorizes.
- Schemas validate.
- Types define contracts.
- DB selects read persistence shapes.
- DTO mappers create transport-safe data.
- Transactions persist atomically.
- Webhooks reconcile provider events idempotently.

## Do Not Cross These Lines

- Do not import DB modules into React components.
- Do not import actions/fetchers into pure components.
- Do not put provider SDK business logic in pages or components.
- Do not return raw DB models or raw provider payloads to UI.
- Do not modify registry primitives unless explicitly allowed.
- Do not use a page as a dumping ground for layout, state, data, mutations, and rendering.

## Ask Instead Of Assuming

Ask the user when:

- a namespace might be a domain or just a UI/platform concern
- a route might be static composition or feature orchestration
- a data shape might be a select, DTO, or UI view model
- a component could belong in blocks, shared, namespace components, or primitives
- provider SDK details may need a wrapper
- primitive/registry component edits are requested indirectly
- security or authorization requirements are underspecified

## Implementation Report Template

When completing work, report:

```txt
Layer classification:
Owner files:
Boundary decisions:
Dependencies used:
Forbidden dependencies avoided:
Validation performed:
Unresolved decisions:
```
