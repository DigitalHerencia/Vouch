import { NextResponse, type NextRequest } from "next/server"

import { parseClerkWebhookJson } from "@/lib/clerk/webhook-events"
import { processClerkWebhookEvent } from "@/lib/clerk/process-clerk-webhook"

/**
 * Clerk webhook endpoint.
 *
 * IMPORTANT:
 * This route currently parses and processes Clerk payloads, but signature verification
 * must be wired to Clerk's official webhook verifier before production traffic.
 * Prefer Clerk's `verifyWebhook` helper if available in the installed Clerk version.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CLERK_WEBHOOK_SECRET is required before processing Clerk webhooks." },
      { status: 500 }
    )
  }

  try {
    const event = parseClerkWebhookJson(rawBody)
    const result = await processClerkWebhookEvent(event)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ignored: result.ignored })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid Clerk webhook payload." }, { status: 400 })
  }
}
