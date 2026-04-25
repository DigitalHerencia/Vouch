import { describe, expect, it } from "vitest"

import {
  extractClerkDisplayName,
  extractClerkUserEmail,
  parseClerkWebhookJson,
} from "@/lib/clerk/webhook-events"

describe("Clerk webhook helpers", () => {
  it("extracts the primary email", () => {
    expect(
      extractClerkUserEmail({
        id: "user_1",
        primary_email_address_id: "email_2",
        email_addresses: [
          { id: "email_1", email_address: "first@example.com" },
          { id: "email_2", email_address: "primary@example.com" },
        ],
      })
    ).toBe("primary@example.com")
  })

  it("builds a display name", () => {
    expect(extractClerkDisplayName({ id: "user_1", first_name: "Ada", last_name: "Lovelace" })).toBe(
      "Ada Lovelace"
    )
  })

  it("parses valid webhook JSON", () => {
    expect(parseClerkWebhookJson(JSON.stringify({ type: "user.created", data: { id: "user_1" } }))).toEqual({
      type: "user.created",
      data: { id: "user_1" },
    })
  })
})
