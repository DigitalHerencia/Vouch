# Pull Request

## Summary

Describe what changed and why.

## Type

- [ ] Feature
- [ ] Fix
- [ ] Refactor
- [ ] Chore
- [ ] Docs
- [ ] Test
- [ ] Security

## Scope Guard

Confirm:

- [ ] Does not introduce marketplace behavior
- [ ] Does not introduce profiles, listings, ratings, reviews, messaging, or discovery
- [ ] Does not introduce disputes, evidence uploads, appeals, or manual fund awards
- [ ] Does not bypass dual confirmation for release
- [ ] Does not store raw card data, raw identity documents, secrets, or full provider payloads

## Architecture Checklist

- [ ] `app/` remains route-shell only
- [ ] page/view orchestration lives in `features/`
- [ ] reusable UI remains in `components/`
- [ ] reads go through `lib/fetcher/*`
- [ ] writes go through `lib/actions/*`
- [ ] DB mutations are isolated in `lib/db/transactions/*`
- [ ] Prisma query projections use `lib/db/selects/*`
- [ ] DTO/read-model mapping uses `lib/db/mappers/*`
- [ ] inputs are validated with Zod schemas
- [ ] authorization checks are server-side
- [ ] provider calls are server-side

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
