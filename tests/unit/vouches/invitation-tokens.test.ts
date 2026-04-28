import { describe, expect, it } from "vitest"

import { createInvitationToken, hashInvitationToken } from "@/lib/invitations/tokens"

describe("invitation token helpers", () => {
  it("creates URL-safe invitation tokens", async () => {
    const token = await createInvitationToken(16)

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it("hashes the same token consistently for actions and fetchers", async () => {
    await expect(hashInvitationToken(" invite-token ")).resolves.toBe(
      await hashInvitationToken("invite-token")
    )
  })
})
