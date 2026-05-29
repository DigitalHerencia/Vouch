Yes. Clerk blueprint, same style.

## BLUEPRINT 1 — Clerk Architecture Decision Record

BEGIN BLUEPRINT

Title: Clerk Authentication Architecture for Appointment Deposit Protocol

Objective:
Use Clerk as the identity, authentication, session, and user-account layer for a SaaS platform where businesses use the app to issue appointment deposit authorization links to their customers.

Core model:

- Clerk owns authentication.
- App database owns product state.
- Clerk user ID is the stable external auth identifier.
- Local database user/account records must sync from Clerk.
- Do not store passwords.
- Do not build custom auth.
- Do not use Clerk as the primary product database.
- Do not put payment state, confirmation state, appointment state, or Stripe state only in Clerk metadata.
- Clerk metadata may be used for lightweight flags only, not canonical business records.

Clerk architecture decisions:

- Framework: Next.js App Router.
- Auth provider: Clerk.
- Middleware: `clerkMiddleware`.
- Auth reads: `auth()` for server-side authorization checks.
- User reads: `currentUser()` only when full Clerk user profile data is required.
- Client reads: `useUser()` / `useAuth()` only in client components.
- Route protection: middleware + server-side guards.
- Server Actions: protect with `auth()`.
- Webhooks: required for syncing Clerk users into local database.
- Webhook verification: Svix verification using Clerk webhook signing secret.
- Organizations: optional. Do not enable unless multi-tenant teams/workspaces are required.
- RBAC: app-owned RBAC/ABAC in database unless Clerk Organizations roles are intentionally adopted.
- User identity mapping: local `User.clerkUserId` unique.
- Tenant/business mapping: local database owns business/tenant records.
- Stripe mapping: local database stores Stripe customer/account IDs; Clerk may store lightweight references only if useful.

Official Clerk docs:

- Clerk’s Next.js SDK provides components, hooks, and helpers for authentication in Next.js. ([Clerk][1])
- `clerkMiddleware()` integrates Clerk authentication into Next.js Middleware and supports App Router. ([Clerk][2])
- Clerk provides server-side and client-side helpers to protect content and read user data. ([Clerk][3])
- Clerk Server Actions can be protected with `auth()` and its `isAuthenticated` value. ([Clerk][4])
- Clerk webhooks send event notifications such as user creation/update events and use Svix. ([Clerk][5])
- Clerk recommends webhooks for syncing Clerk data into an app database. ([Clerk][6])
- Clerk Organizations support multi-tenant B2B apps with roles and permissions. Only use this if the product needs organization switching/team membership. ([Clerk][7])

Implementation guardrails:

- Do not query Clerk in middleware to create database records.
- Do not rely on Clerk metadata as source of truth for payments, deposits, confirmations, or Stripe state.
- Do not expose protected routes using only client-side checks.
- Do not trust client-provided Clerk IDs.
- Do not allow unauthenticated Server Actions.
- Do not perform tenant authorization only by user ID; always check user-to-tenant/business membership in database.
- Do not make Clerk Organizations mandatory unless product needs multi-user businesses.
- Do not put Stripe secrets, webhook secrets, or sensitive payment state in Clerk metadata.

END BLUEPRINT

---

## BLUEPRINT 2 — Codex Implementation Prompt

BEGIN CODEX PROMPT

Implement Clerk authentication for a Next.js App Router SaaS application.

Use Clerk as the auth/session provider and the local database as the product source of truth.

Canonical decisions:

- Use `@clerk/nextjs`.
- Use `ClerkProvider` in the root layout.
- Use `clerkMiddleware()` in middleware.
- Protect server routes and Server Actions with `auth()`.
- Use `currentUser()` only when full Clerk profile details are needed.
- Use Clerk webhooks to sync user lifecycle events into the local database.
- Verify Clerk webhooks with Svix.
- Store canonical app state in the database, not Clerk metadata.
- Store `clerkUserId` as a unique field on the local user table.
- Store Stripe IDs in local database records.
- Use database membership/role checks for business/tenant authorization.
- Do not use Clerk Organizations unless the current product explicitly needs multi-user business workspaces.

Required implementation:

1. Provider setup

- Install and configure Clerk for Next.js App Router.
- Wrap the app with `ClerkProvider`.
- Ensure sign-in/sign-up routes or Clerk components are configured.
- Use environment variables:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`
  - sign-in/sign-up redirect URLs as needed.

2. Middleware

- Add `clerkMiddleware()` to `middleware.ts`.
- Define public routes explicitly.
- Protect all dashboard/app/product routes.
- Keep API webhook routes public at middleware level but verify signatures inside handlers.
- Do not perform database user creation inside middleware.

3. Local database user sync

- Create or update local user records from Clerk webhook events.
- Required local user fields:
  - id
  - clerkUserId unique
  - email
  - firstName
  - lastName
  - imageUrl
  - createdAt
  - updatedAt
  - deletedAt or status if soft delete is used

- Handle at least:
  - `user.created`
  - `user.updated`
  - `user.deleted`

- Make webhook processing idempotent.
- Store processed webhook event IDs if available.
- Never trust webhook payloads without Svix verification.

4. Auth helpers
   Create server-side auth utilities:

- `requireUser()`
  - calls `auth()`
  - throws/redirects if unauthenticated
  - returns `userId`

- `getCurrentAppUser()`
  - maps Clerk `userId` to local DB user
  - does not create users silently unless explicitly intended

- `requireBusinessAccess(businessId, allowedRoles?)`
  - verifies authenticated user belongs to requested business/tenant
  - checks local DB role/permissions

- `requireAdmin()` if admin area exists.

5. Server Actions

- Every protected Server Action must call `auth()` or a helper built on `auth()`.
- Never accept `userId` from form data as authority.
- Use authenticated Clerk user ID from server context.
- Check local business/tenant permissions before mutating records.

6. API routes

- Protect internal API routes with `auth()`.
- Keep Clerk webhook endpoint signature-verified, not auth-protected.
- Keep Stripe webhook endpoint signature-verified, not auth-protected.
- Never rely on client-side route protection alone.

7. Client components

- Use `SignedIn`, `SignedOut`, `UserButton`, `SignInButton`, `SignUpButton` where useful.
- Use `useUser()` only in client components.
- Avoid using client user data for authorization decisions.
- Client may hide/show UI, but server must enforce permissions.

8. RBAC / ABAC

- Store product roles and permissions in the local database.
- Example roles:
  - owner
  - admin
  - member
  - customer, only if customers authenticate into the app

- Do not use Clerk public metadata as the only authorization source.
- Clerk metadata can mirror non-sensitive UI hints, but database remains authoritative.

9. Business/tenant model

- User can own or belong to one or more businesses if needed.
- Business/tenant records live in the app database.
- Membership table should connect local user to business.
- Stripe connected account IDs belong on business records.
- Platform fee/payment state belongs in app database.
- Deposit/confirmation state belongs in app database.

10. Tests / test stubs
    Add tests or test stubs for:

- unauthenticated protected route rejected
- authenticated user can access allowed route
- user without business membership cannot access business record
- Server Action rejects unauthenticated request
- Server Action rejects wrong business
- webhook signature verification fails on bad signature
- `user.created` creates local user
- `user.updated` updates local user
- duplicate webhook event is ignored
- deleted Clerk user is soft-deleted or deactivated locally

Explicit non-goals:

- Do not build custom password auth.
- Do not store passwords.
- Do not make Clerk metadata the product database.
- Do not create database users from middleware.
- Do not authorize by client-provided IDs.
- Do not adopt Clerk Organizations unless explicitly required.
- Do not expose Stripe/payment/deposit state solely through Clerk metadata.

Use official Clerk docs as the source of truth. Preserve this architecture unless Clerk API constraints force a change. If a constraint is found, document the exact limitation and propose the smallest compliant alternative.

END CODEX PROMPT

---

## BLUEPRINT 3 — Clerk Configuration Summary

BEGIN CONFIG SUMMARY

Selected Clerk configuration:

- Auth provider: Clerk
- Framework: Next.js App Router
- SDK: `@clerk/nextjs`
- Provider: `ClerkProvider`
- Middleware: `clerkMiddleware()`
- Server auth helper: `auth()`
- Full user fetch: `currentUser()` only when needed
- Client hooks/components: `useUser()`, `useAuth()`, `UserButton`, `SignedIn`, `SignedOut`
- Webhooks: enabled
- Webhook verification: Svix
- Local user sync: required
- Local DB source of truth: yes
- Clerk metadata source of truth: no
- Organizations: optional / not default
- RBAC/ABAC: app database
- Tenant/business authorization: app database membership checks
- Stripe IDs: app database
- Payment/deposit/confirmation state: app database
- Protected Server Actions: `auth()` required
- Public webhook routes: allowed through middleware, verified by signature in route handler

Required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

END CONFIG SUMMARY

[1]: https://clerk.com/docs/nextjs/getting-started/quickstart?utm_source=chatgpt.com "Next.js Quickstart (App Router) - Getting started"
[2]: https://clerk.com/docs/reference/nextjs/clerk-middleware?utm_source=chatgpt.com "clerkMiddleware() | Next.js - SDK Reference"
[3]: https://clerk.com/docs/nextjs/guides/users/reading?utm_source=chatgpt.com "Read session and user data in your Next.js app ..."
[4]: https://clerk.com/docs/reference/nextjs/app-router/server-actions?utm_source=chatgpt.com "Server Actions - App Router - Next.js"
[5]: https://clerk.com/docs/guides/development/webhooks/overview?utm_source=chatgpt.com "Webhooks overview | Clerk Docs"
[6]: https://clerk.com/docs/guides/development/webhooks/syncing?utm_source=chatgpt.com "Sync Clerk data to your app with webhooks"
[7]: https://clerk.com/docs/nextjs/guides/organizations/getting-started?utm_source=chatgpt.com "Get started with Organizations"
