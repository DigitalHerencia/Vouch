import { NextResponse, type NextRequest } from "next/server"

import { handleVerifiedClerkWebhook, verifyClerkWebhook } from "@/lib/auth/webhooks"

export async function POST(request: NextRequest) {
  try {
    const event = await verifyClerkWebhook(request)
    const result = await handleVerifiedClerkWebhook(event)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ignored: result.ignored })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid Clerk webhook signature or payload." }, { status: 400 })
  }
}
