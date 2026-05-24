import { NextResponse, type NextRequest } from "next/server"

import { handleVerifiedClerkWebhook, verifyClerkWebhook } from "@/lib/auth/webhooks"

export async function POST(request: NextRequest) {
  const svixId = request.headers.get("svix-id")
  if (!svixId) {
    return NextResponse.json({ ok: false, error: "Missing svix-id." }, { status: 400 })
  }

  let event: unknown
  try {
    event = await verifyClerkWebhook(request)
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid Clerk webhook signature or payload." },
      { status: 400 }
    )
  }

  const result = await handleVerifiedClerkWebhook({ svixId, event })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: result.status })
}
