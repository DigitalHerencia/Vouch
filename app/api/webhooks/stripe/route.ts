import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Webhook handler not implemented" },
    { status: 501 }
  )
}
