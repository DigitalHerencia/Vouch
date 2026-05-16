import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { VouchStatusBadge } from "@/components/vouches/vouch-status-badge"

describe("VouchStatusBadge", () => {
  it("renders visible text for status", () => {
    render(<VouchStatusBadge status="authorized" />)

    expect(screen.getByText(/authorized/i)).toBeInTheDocument()
  })

  it("does not rely on color alone", () => {
    render(<VouchStatusBadge status="expired" />)

    expect(screen.getByText(/expired/i)).toBeInTheDocument()
  })
})
