/**
 * Vouch route protection.
 *
 * Public routes: marketing, legal, auth, invite landing, and signed provider webhooks.
 * Protected routes: dashboard, setup, settings, Vouch detail/create/confirm, admin.
 *
 * Admin capability and participant authorization must still be enforced server-side in
 * fetchers/actions. This proxy only handles authentication boundary routing.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/how-it-works(.*)",
  "/pricing(.*)",
  "/faq(.*)",
  "/legal/terms(.*)",
  "/legal/privacy(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/vouches/invite(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/webhooks/stripe(.*)",
])

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname, search } = req.nextUrl

  if (isAuthRoute(req) && userId) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect_url", `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
