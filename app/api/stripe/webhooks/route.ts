import { NextResponse, type NextRequest } from "next/server"

import {
  isStripeAccountEventNotification,
  verifyStripeWebhookEvent,
} from "@/lib/integrations/stripe/webhook-events"
import {
  processStripeAccountEventNotification,
  processStripeWebhookEvent,
} from "@/lib/webhooks/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  const verified = await verifyStripeWebhookEvent(rawBody, signature)

  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.message }, { status: verified.status })
  }

  const processed = isStripeAccountEventNotification(verified.event)
    ? await processStripeAccountEventNotification(verified.event)
    : await processStripeWebhookEvent(verified.event)

  if (!processed.ok) {
    return NextResponse.json({ ok: false, error: processed.formError }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    processed: processed.data?.processed ?? false,
    duplicate: processed.data?.duplicate ?? false,
  })
}
