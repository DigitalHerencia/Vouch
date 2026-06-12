# Vouch Agent Manifest

This repository uses a compact governance system. Start here, then follow the referenced context, contracts, instructions, and execution state.

## Governance Map

Human-readable context lives in `context/`.

- `context/docs/architecture.md` — technical architecture, boundaries, provider/environment rules, and source-of-truth order.
- `context/docs/prd.md` — product requirements, product model, lifecycle, flows, launch scope, and non-goals.
- `context/docs/design-system.md` — visual system, tokens, component inventory, styling rules, and UI contribution policy.
- `context/instructions/*.md` — implementation-specific instructions for Codex agents working in this repository.

Machine-readable agent governance lives in `.agents/`.

- `.agents/contracts/product.yaml` — deterministic product, payment, auth, lifecycle, route, and architecture constraints.
- `.agents/contracts/design.yaml` — deterministic design-token, component, styling, accessibility, and UI consistency constraints.
- `.agents/contracts/validation.yaml` — validation policy, quality gates, success gates, stop conditions, and reporting requirements.
- `.agents/execution/decisions.json` — durable decision log.
- `.agents/execution/handoff.json` — current project handoff state for the next agent.
- `.agents/execution/progress.json` — implementation tracker and active work queue.

## Source Of Truth Order

When sources conflict, stop and report the exact conflict before editing.

1. User instruction in the current task.
2. `context/docs/*.md`.
3. `.agents/contracts/*.yaml`.
4. `context/instructions/*.md`.
5. Existing source code.
6. Implementation judgment.

Execution JSON files track operational state. They do not override context docs, contracts, or explicit user instruction.

## Required First Pass

Before product, architecture, auth, payment, database, route, workflow, or UI changes:

1. Read this file.
2. Read the relevant `context/docs/*.md` files.
3. Read the relevant `.agents/contracts/*.yaml` files.
4. Read the relevant `context/instructions/*.md` files.
5. Check `.agents/execution/handoff.json` and `.agents/execution/progress.json`.
6. Identify conflicts, stale assumptions, blocked work, or validation limits before editing.

## Working Rules

- Keep changes narrow and intentional.
- Do not invent business rules, routes, product surfaces, payment flows, database fields, legal copy, or design primitives.
- Preserve route, feature, component, lib, schema, type, and provider boundaries.
- Use existing conventions before introducing new ones.
- Do not run dev servers, migrations, deployments, provider mutations, or broad validation unless explicitly requested.
- If validation is allowed, run the narrowest relevant validation.
- If validation is not run, state that clearly.
- Update `.agents/execution/*` when decisions are made, implementation state changes, or validation status changes.

## Stop Conditions

Stop before editing when:

- Context docs conflict with contracts.
- Existing code enforces a rule contradicted by active governance.
- A requested change creates a forbidden product surface.
- A requested change weakens payment, auth, provider, tenant, or lifecycle boundaries.
- A migration may destroy or backfill data without explicit approval.
- A provider operation may affect live Stripe, Clerk, Neon, Vercel, or another external environment without explicit approval.
- Validation failure cannot be safely resolved inside the requested scope.
