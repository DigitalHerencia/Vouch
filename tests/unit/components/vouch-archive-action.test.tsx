import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

import { VouchArchiveAction } from "@/features/vouches/vouchArchiveAction"

describe("VouchArchiveAction", () => {
  it("archives the Vouch and refreshes the current detail page", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true, data: { vouchId: "vouch_1" } })
    const refresh = vi.fn()

    render(<VouchArchiveAction action={action} refresh={refresh} vouchId="vouch_1" />)

    fireEvent.click(screen.getByRole("button", { name: "Archive Vouch" }))

    await waitFor(() => expect(action).toHaveBeenCalledWith({ vouchId: "vouch_1" }))
    expect(refresh).toHaveBeenCalledOnce()
  })
})
