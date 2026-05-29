Yes. Clerk + Prisma blueprint with schema.

## BLUEPRINT 1 — Clerk + Prisma Architecture

BEGIN BLUEPRINT

Title: Clerk + Prisma Auth/Data Architecture

Objective:
Use Clerk for authentication and sessions. Use Prisma/PostgreSQL as the canonical application database.

Core rule:
Clerk owns identity. Prisma owns product state.

Clerk is responsible for:

- Sign up
- Sign in
- Sessions
- Email identity
- User profile source events
- Auth proxy.ts
- Server auth checks

Prisma is responsible for:

- Local users
- Merchantes
- Memberships
- Roles
- Stripe IDs
- Deposit/payment state
- Confirmation state
- App permissions
- Webhook idempotency

Official Clerk facts:

- Clerk’s Next.js SDK provides components, hooks, server helpers, and middleware for authentication. ([Clerk][1])
- `clerkMiddleware()` integrates Clerk authentication into Next.js proxy.ts. ([Clerk][2])
- `auth()` is the server-side helper for reading the current authenticated user and protecting routes/actions. ([Clerk][3])
- Clerk webhooks are used to sync Clerk data into your database, and webhook routes must be public but signature-verified. ([Clerk][4])
- `currentUser()` fetches the full Backend User object, but Clerk warns to use it only when needed because it counts against Backend API limits. ([Clerk][5])

Guardrails:

- Do not store passwords.
- Do not build custom auth.
- Do not use Clerk metadata as the source of truth for product data.
- Do not create database users in middleware.
- Do not authorize by client-provided user IDs.
- Do not store Stripe/payment/deposit state only in Clerk metadata.
- Do not use `currentUser()` when `auth().userId` is enough.
- Do not protect webhook routes with Clerk auth; verify webhook signatures instead.

END BLUEPRINT

---

## BLUEPRINT 2 — Prisma Schema Blueprint

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  DISABLED
  DELETED
}

enum StripeAccountStatus {
  NOT_STARTED
  ONBOARDING_STARTED
  PENDING_VERIFICATION
  READY
  RESTRICTED
  DISABLED
}

enum PlatformFeeStatus {
  NOT_REQUIRED
  REQUIRED
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum DepositStatus {
  DRAFT
  FEE_REQUIRED
  READY_FOR_AUTHORIZATION
  AUTHORIZATION_CREATED
  AUTHORIZED
  CONFIRMED
  CAPTURED
  CANCELED
  EXPIRED
  FAILED
}

enum ConfirmationStatus {
  PENDING
  CONFIRMED
  REJECTED
  EXPIRED
}

enum WebhookProvider {
  CLERK
  STRIPE
}

model User {
  id            String     @id @default(cuid())
  clerkUserId   String     @unique
  email         String?
  firstName     String?
  lastName      String?
  imageUrl      String?
  status        UserStatus @default(ACTIVE)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?

  @@index([email])
}

model Merchant {
  id                         String              @id @default(cuid())
  name                       String
  status                     MerchantStatus      @default(ACTIVE)

  stripeAccountId             String?             @unique
  stripeCustomerId            String?
  stripeAccountStatus         StripeAccountStatus @default(NOT_STARTED)

  stripeCardPaymentsActive    Boolean             @default(false)
  stripeTransfersActive       Boolean             @default(false)
  stripeChargesEnabled        Boolean             @default(false)
  stripePayoutsEnabled        Boolean             @default(false)
  stripeDetailsSubmitted      Boolean             @default(false)

  members                     MerchantMember[]
  platformFees                PlatformFee[]
  deposits                    Deposit[]

  createdAt                   DateTime            @default(now())
  updatedAt                   DateTime            @updatedAt
  deletedAt                   DateTime?

  @@index([status])
  @@index([stripeAccountStatus])
}

model PlatformFee {
  id                      String            @id @default(cuid())
  merchantId              String
  merchant                Merchant          @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  amountCents             Int
  currency                String            @default("usd")
  status                  PlatformFeeStatus @default(PENDING)

  stripeCheckoutSessionId String?           @unique
  stripePaymentIntentId   String?           @unique

  paidAt                  DateTime?
  failedAt                DateTime?
  refundedAt              DateTime?

  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt

  @@index([merchantId, status])
}

model Deposit {
  id                         String             @id @default(cuid())
  merchantId                 String
  merchant                   Merchant           @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  platformFeeId              String?
  appointmentAt              DateTime
  confirmationWindowStart    DateTime
  confirmationWindowEnd      DateTime
  authorizationAllowedAfter  DateTime

  amountCents                Int
  currency                   String             @default("usd")
  status                     DepositStatus      @default(DRAFT)

  stripeConnectedAccountId   String
  stripeCheckoutSessionId    String?            @unique
  stripePaymentIntentId      String?            @unique
  stripeChargeId             String?

  merchantConfirmationStatus ConfirmationStatus @default(PENDING)
  customerConfirmationStatus ConfirmationStatus @default(PENDING)
  merchantConfirmedAt        DateTime?
  customerConfirmedAt        DateTime?

  authorizedAt               DateTime?
  capturedAt                 DateTime?
  canceledAt                 DateTime?
  expiredAt                  DateTime?

  captureIdempotencyKey      String?            @unique
  cancelIdempotencyKey       String?            @unique

  createdAt                  DateTime           @default(now())
  updatedAt                  DateTime           @updatedAt

  @@index([merchantId, status])
  @@index([appointmentAt])
  @@index([stripeConnectedAccountId])
}

model WebhookEvent {
  id          String          @id @default(cuid())
  provider    WebhookProvider
  eventId     String
  eventType   String
  processedAt DateTime?
  payload     Json?

  createdAt   DateTime        @default(now())

  @@unique([provider, eventId])
  @@index([provider, eventType])
}
```

---

## BLUEPRINT 3 — Codex Prompt

BEGIN CODEX PROMPT

Implement Clerk + Prisma authentication persistence for a Next.js App Router app.

Architecture:

- Clerk owns auth and sessions.
- Prisma/PostgreSQL owns app data.
- Clerk user IDs must sync into local `User` records.
- Stripe IDs and payment state must live in Prisma, not Clerk metadata.

Use the Prisma schema below as the target data model.

Required implementation:

1. Clerk provider

- Use `ClerkProvider` in the root layout.
- Use Clerk sign-in/sign-up components or configured Clerk routes.
- Use environment variables for Clerk keys and redirects.

2. Proxy

- Use `clerkMiddleware()`.
- Protect app/dashboard/merchant routes.
- Keep `/api/webhooks/clerk` public.
- Keep `/api/webhooks/stripe` public.
- Do not create Prisma users in middleware.

3. Clerk webhook endpoint

- Create `/api/webhooks/clerk/route.ts`.
- Verify webhook signatures with Svix using `CLERK_WEBHOOK_SECRET`.
- Handle:
  - `user.created`
  - `user.updated`
  - `user.deleted`

- Upsert local `User` by `clerkUserId`.
- Soft-delete or disable local users on `user.deleted`.
- Store processed webhook IDs in `WebhookEvent`.
- Make webhook handling idempotent.

4. Auth helpers
   Create server-only helpers:

- `requireAuth()`
  - calls `auth()`
  - returns Clerk `userId`
  - throws or redirects if unauthenticated

- `getCurrentUser()`
  - maps Clerk `userId` to Prisma `User`

5. Prisma authorization rule
   Every protected mutation must:

- get Clerk user ID from server context
- map to local User

Never trust:

- client-provided `userId`
- client-provided `clerkUserId`

6. Stripe readiness fields

- `stripeAccountId`
- `stripeCustomerId`
- account status
- card payment capability readiness
- transfer/payout readiness
- charges enabled
- payouts enabled
- details submitted

7. Tests or test stubs
   Add tests for:

- Clerk webhook creates user
- Clerk webhook updates user
- Clerk webhook soft-deletes user
- duplicate Clerk webhook ignored
- protected Server Action rejects unauthenticated calls

Explicit non-goals:

- Do not use Clerk Organizations unless explicitly requested.
- Do not use Clerk metadata as the source of truth for roles.
- Do not store passwords.
- Do not build custom auth.
- Do not create users in middleware.
- Do not put payment state in Clerk metadata.

END CODEX PROMPT

[1]: https://clerk.com/docs/reference/nextjs/overview?utm_source=chatgpt.com "Clerk Next.js SDK - SDK Reference | Clerk Docs"
[2]: https://clerk.com/docs/reference/nextjs/clerk-middleware?utm_source=chatgpt.com "clerkMiddleware() | Next.js - SDK Reference"
[3]: https://clerk.com/docs/reference/nextjs/app-router/auth?utm_source=chatgpt.com "auth() - App Router - Next.js"
[4]: https://clerk.com/docs/guides/development/webhooks/syncing?utm_source=chatgpt.com "Sync Clerk data to your app with webhooks"
[5]: https://clerk.com/docs/reference/nextjs/app-router/current-user?utm_source=chatgpt.com "currentUser() - App Router - Next.js"
