import { NextResponse, type NextRequest } from "next/server"

import { processStripeWebhookEvent } from "@/lib/payments/webhooks/process-stripe-webhook"
import { verifyStripeWebhookEvent } from "@/lib/stripe/webhook-events"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  const verified = await verifyStripeWebhookEvent(rawBody, signature)

  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.message }, { status: verified.status })
  }

  const processed = await processStripeWebhookEvent(verified.event)

  if (!processed.ok) {
    return NextResponse.json({ ok: false, error: processed.message }, { status: processed.status })
  }

  return NextResponse.json({ ok: true, processed: processed.processed })
}
