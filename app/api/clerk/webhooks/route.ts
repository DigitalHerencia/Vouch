// app/api/clerk/webhooks/route.ts

import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextResponse, type NextRequest } from "next/server"

import { processClerkWebhookEvent } from "@/lib/webhooks/clerk"
import type { ClerkWebhookEvent } from "@/types/authTypes"

function getClerkWebhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is required")
  }

  return secret
}

export async function POST(request: NextRequest) {
  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { ok: false, error: "Missing Clerk webhook signature headers." },
      { status: 400 }
    )
  }

  let event: unknown
  try {
    event = await verifyWebhook(request, {
      signingSecret: getClerkWebhookSecret(),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "CLERK_WEBHOOK_SECRET is required") {
      return NextResponse.json({ ok: false, error: "Webhook is not configured." }, { status: 500 })
    }

    return NextResponse.json(
      { ok: false, error: "Invalid Clerk webhook signature or payload." },
      { status: 400 }
    )
  }

  const result = await processClerkWebhookEvent(event as ClerkWebhookEvent, svixId)

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: result.status })
}
